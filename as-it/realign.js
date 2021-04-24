const AsIt = require('./map');
const $ = require('../func');

const {chain_} = AsIt;

async function* chunkByCount(iter, count) {
  let buf = [];

  for await (const item of iter) {
    if (buf.push(item) === count) {
      yield buf;
      buf = [];
    }
  }

  if (buf.length) yield buf;
}

async function* chunkByCountFunc(iter, msec, count, ...funcs) {
  let snap = msec && $.upMsec();
  let desc = {buf: [], idx: 0, snap, iter, ctx: this};

  for await (const item of iter) {
    let newChunk = chunkByCountFunc;

    for (const func of funcs) {
      if (!func) continue;
      if (newChunk === chunkByCountFunc) newChunk = await func.call(this, item, item, desc);
      else newChunk = await func.call(this, newChunk, item, desc);
    }

    if (newChunk === chunkByCountFunc) newChunk = false;

    if (msec && !newChunk && $.upMsec(desc.snap) > msec) {
      newChunk = true;
    }

    if (newChunk && desc.buf.length) {
      yield desc.buf;
      desc.buf = [];
    }

    if (msec) {
      if (newChunk) desc.snap = snap;
      snap = $.upMsec();
    }

    if (desc.buf.push(item) === count) {
      newChunk = true;
      yield desc.buf;
      desc.buf = [];
      desc.snap = snap;
    }

    desc.idx++;
  }

  if (desc.buf.length) yield desc.buf;
}

chain_(async function* chunk(iter, count, func, ...funcs) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, 0, 0, count, func, ...funcs);
  else if (typeof func === 'function') yield* chunkByCountFunc(iter, 0, count, func, ...funcs);
  else yield* chunkByCount(iter, count);
});

chain_(async function* chunkMsec(iter, msec, count, func, ...funcs) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, msec, 0, count, func, ...funcs);
  yield* chunkByCountFunc(iter, msec, count, func, ...funcs);
});

chain_(async function* flatten(iter, depth) {
  if (depth == null) { depth = 1; }
  else if (depth === 0) { yield* iter; return; }

  for await (const item of iter) {
    const it = AsIt.getIter(item);

    if (!it) yield item;
    else if (depth === 1) yield* it;
    else yield* flatten(it, depth - 1);
  }
});

function isIter(itrb) {
  const gen = AsIt.getGen(itrb);
  if (!gen) return [itrb];
  const iter = AsIt.getIter(gen);
  return [itrb, iter, itrb != iter && gen, true];
}

function countIter(sum, i2) {
  if (i2[1]) sum++;
  return sum;
}

chain_(async function* zipt(...iters) {
  const l = iters.length;
  if (!l) return;

  const its = iters.map(isIter);
  let active = its.reduce(countIter, 0);
  let safe;

  try {
    while (active) {
      for (const it of its) {
        if (it[1]) {
          safe = true;

          while (true) {
            const [, iter, gen, first] = it;
            let value, done;

            try { ({value, done} = await iter.next()); }
            catch (err) { it.fill(); throw err; }

            if (done) {
              if (first) { active--; it[3] = false; }

              if (gen && safe) {
                safe = false;
                it[1] = AsIt.getIter(gen);
                continue;
              } else {
                it.fill();
                yield;
              }
            } else {
              yield value;
            }

            break;
          }
        } else {
          yield it[0];
        }
      }
    }
  /*} catch (err) {
    for (const [, iter] of its) {
      if (iter && iter.throw) try {
        await iter.throw(err);
      } catch (e) { console.log('???', e); err = e; }
    }

    throw err;*/
  } finally {
    for (const [, iter] of its) {
      if (iter && iter.return) {
        await iter.return();
      }
    }
  }
});

chain_(async function* zip(...iters) {
  const l = iters.length;
  if (!l) return;

  const zipt = AsIt.zipt.gen.call(this, ...iters);
  const cut = AsIt.map.gen.call(this, zipt, $.lag_(l));
  await AsIt.ffwd(cut, l);
  yield* cut;
});

process.on('unhandledRejection', console.log);

module.exports = AsIt;
