const AsIt = require('./map');
const $ = require('../func');

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
    let newChunk = 0;

    for (const func of funcs) {
      if (func) newChunk = await func.call(this, item, desc, newChunk);
    }

    if (msec && newChunk <= 0 && $.upMsec(desc.snap) > msec) {
      newChunk = 1;
    }

    if (newChunk > 0 && desc.buf.length) {
      yield desc.buf;
      desc.buf = [];
    }

    if (msec) {
      if (newChunk > 0) desc.snap = snap;
      snap = $.upMsec();
    }

    if (desc.buf.push(item) === count || newChunk < 0) {
      yield desc.buf;
      desc.buf = [];
      desc.snap = snap;
    }

    desc.idx++;
  }

  if (desc.buf.length) yield desc.buf;
}

AsIt.chain_(async function* chunk(iter, count, func, ...funcs) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, 0, 0, count, func, ...funcs);
  else if (typeof func === 'function') yield* chunkByCountFunc(iter, 0, count, func, ...funcs);
  else yield* chunkByCount(iter, count);
});

AsIt.chain_(async function* chunkMsec(iter, msec, count, func, ...funcs) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, msec, 0, count, func, ...funcs);
  yield* chunkByCountFunc(iter, msec, count, func, ...funcs);
});

AsIt.chain_(async function* flatten(iter, depth) {
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

AsIt.chain_(async function* cut(iter, n) {
  if (!n || !Number.isInteger(n)) return yield* iter;
  let cutted;

  if (n > 0) {
    cutted = iter;
  } else {
    cutted = AsIt.map.gen.call(this, iter, n);
    n = -n;
  }

  await AsIt.affwd(cutted, n);
  yield* cutted;
});

AsIt.chain_(async function* zipt(...iters) {
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

AsIt.chain_(async function* zip(...iters) {
  const l = iters.length;
  if (!l) return;

  const zipt = AsIt.zipt.gen.call(this, ...iters);
  const cut = AsIt.cut.gen.call(this, zipt, -l);
  yield* cut;
});

async function *partialDim(pfx, dim1, dim2, ...dims) {
  const desc = {iter: dim1, ctx: this};

  for await (const item of dim1) {
    const out = [...pfx, item];

    if (dim2) {
      const iter = AsIt.getIter.call(this, dim2, false, out, desc);
      yield* partialDim.call(this, out, iter || [dim2], ...dims);
    } else {
      yield out;
    }
  }
};

AsIt.chain_(async function* dim(...dims) {
  const pfx = [];
  yield* partialDim.call(this, pfx, ...dims);
});

AsIt.chain_(async function* sep(iter, gen, ...funcs) {
  const desc = {iter, ctx: this};
  let idx = 0;

  for await (item of iter) {
    if (idx) {
      let v = true;
      for (const func of funcs) v = await func.call(this, v, item, idx, desc);

      if (v) {
        const it = AsIt.getIter.call(this, gen, false, item, idx, desc);
        if (it) yield* it; else yield gen;
      }
    }

    yield item;
    idx++;
  }
});

module.exports = AsIt;
