const Iter = require('./map');
const $ = require('../func');

function* chunkByCount(iter, count) {
  let buf = [];

  for (const item of iter) {
    if (buf.push(item) === count) {
      yield buf;
      buf = [];
    }
  }

  if (buf.length) yield buf;
}

function* chunkByCountFunc(iter, count, ...funcs) {
  const desc = {buf: [], idx: 0, iter, ctx: this};

  for (const item of iter) {
    let newChunk = 0;

    for (const func of funcs) {
      if (func) newChunk = func.call(this, item, desc, newChunk);
    }

    if (newChunk > 0 && desc.buf.length) {
      yield desc.buf;
      desc.buf = [];
    }

    if (desc.buf.push(item) === count || newChunk < 0) {
      yield desc.buf;
      desc.buf = [];
    }

    desc.idx++;
  }

  if (desc.buf.length) yield desc.buf;
}

Iter.chain_(function* chunk(iter, count, func, ...funcs) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, 0, count, func, ...funcs);
  else if (typeof func === 'function') yield* chunkByCountFunc(iter, count, func, ...funcs);
  else yield* chunkByCount(iter, count);
});

Iter.chain_(function* flatten(iter, depth) {
  if (depth == null) { depth = 1; }
  else if (depth === 0) { yield* iter; return; }

  for (const item of iter) {
    const it = Iter.getIter(item);

    if (!it) yield item;
    else if (depth === 1) yield* it;
    else yield* flatten(it, depth - 1);
  }
});

function isIter(itrb) {
  const gen = Iter.getGen(itrb);
  if (!gen) return [itrb];
  const iter = Iter.getIter(gen);
  return [itrb, iter, itrb != iter && gen, true];
}

function countIter(sum, i2) {
  if (i2[1]) sum++;
  return sum;
}

Iter.chain_(function* zipt(...iters) {
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

            try { ({value, done} = iter.next()); }
            catch (err) { it.fill(); throw err; }

            if (done) {
              if (first) { active--; it[3] = false; }

              if (gen && safe) {
                safe = false;
                it[1] = Iter.getIter(gen);
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
        iter.throw(err);
      } catch (e) { err = e; }
    }

    throw err;*/
  } finally {
    for (const [, iter] of its) {
      if (iter && iter.return) {
        iter.return();
      }
    }
  }
});

Iter.chain_(function* cut(iter, n) {
  if (!n || !Number.isInteger(n)) return yield* iter;
  let cutted;

  if (n > 0) {
    cutted = iter;
  } else {
    cutted = Iter.map.gen.call(this, iter, n);
    n = -n;
  }

  Iter.ffwd(cutted, n);
  yield* cutted;
});

Iter.chain_(function* zip(...iters) {
  const l = iters.length;
  if (!l) return;

  const zipt = Iter.zipt.gen.call(this, ...iters);
  const cut = Iter.cut.gen.call(this, zipt, -l);
  yield* cut;
});

function *partialDim(pfx, dim1, dim2, ...dims) {
  const desc = {iter: dim1, ctx: this};

  for (const item of dim1) {
    const out = [...pfx, item];

    if (dim2) {
      const iter = Iter.getIter.call(this, dim2, false, out, desc);
      yield* partialDim.call(this, out, iter || [dim2], ...dims);
    } else {
      yield out;
    }
  }
};

Iter.chain_(function *dim(...dims) {
  const pfx = [];
  yield* partialDim.call(this, pfx, ...dims);
});

Iter.chain_(function* sep(iter, gen, ...funcs) {
  const desc = {iter, ctx: this};
  let idx = 0;

  for (item of iter) {
    if (idx) {
      let v = true;
      for (const func of funcs) v = func.call(this, v, item, idx, desc);

      if (v) {
        const it = Iter.getIter.call(this, gen, false, item, idx, desc);
        if (it) yield* it; else yield gen;
      }
    }

    yield item;
    idx++;
  }
});

module.exports = Iter;
