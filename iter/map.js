const Iter = require('./base');
const $ = require('../func/map');

const {chain_} = Iter;

chain_(function* map(iter, ...funcs) {
  const l = $._mappingFuncs(funcs, false);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};
  let idx = 0;

  if (l === 1) {
    const func = funcs[0];

    for (const item of iter) {
      yield func.call(this, item, idx, desc, item);
      idx++;
    }
  } else {
    for (const item of iter) {
      let v = item;

      for (const func of funcs) {
        v = func.call(this, v, idx, desc, item);
      }

      yield v;
      idx++;
    }
  }
});

chain_(function* maps(iter, ...funcs) {
  const l = $._mappingFuncs(funcs, true);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};
  let idx = 0;

  for (const item of iter) {
    let v = item;

    for (const func of funcs) {
      v = func.call(this, v, idx, desc, item);
    }

    idx++;
    if (v == null) continue;
    const it = Iter.getIter(v);
    if (it) yield* it; else yield v;
  }
});

chain_(function* mapTo(iter, to, ...funcs) {
  const l = $._mappingFuncs(funcs, false);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};
  let idx = 0;

  for (const item of iter) {
    let v = item;

    for (const func of funcs) {
      v = func.call(this, v, idx, desc, item);
    }

    const p = to.call(this, item, idx, desc, item);
    if (p) p.ctx[p.key] = v;

    yield item;
    idx++;
  }
});

chain_(function mapAt(iter, at, ...funcs) {
  if (!(at instanceof Array)) at = [at];
  return Iter.mapTo.gen(iter, $.to_(...at), $.in_(...at), ...funcs);
});

chain_(function mapKeys(iter, ...funcs) {
  return Iter.mapAt.gen(iter, 0, ...funcs);
});

chain_(function mapValues(iter, ...funcs) {
  return Iter.mapAt.gen(iter, 1, ...funcs);
});

module.exports = Iter;
