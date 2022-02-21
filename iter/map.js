const Iter = require('./make');
const _ = require('../func/map');

Iter.chain_(function* map(iter, ...funcs) {
  const l = _._mappingFuncs(funcs, false);
  if (!l) { yield* iter; return; }

  let value, done;
  const resFunc = l === 1 ? funcs[0] : _.cascadeFunc.bind(this, funcs);
  const desc = {iter, ctx: this};
  let idx = 0;

  try {
    while ({value, done} = iter.next(), !done) {
      const result = resFunc.call(this, value, idx, desc, value);
      if (result === _.stop) return;
      if (result === _.pass) { done = true; yield value; yield* iter; return; }
      yield result;
      ++idx;
    }
  } finally {
    if (!done && iter.return) iter.return();
  }
});

Iter.chain_(function* maps(iter, ...funcs) {
  const l = _._mappingFuncs(funcs, true);
  if (!l) { yield* iter; return; }

  let value, done;
  const resFunc = l === 1 ? funcs[0] : _.cascadeFunc.bind(this, funcs);
  const desc = {iter, ctx: this};
  let idx = 0;

  try {
    while ({value, done} = iter.next(), !done) {
      const result = resFunc.call(this, value, idx, desc, value);
      if (result === _.stop) return;
      if (result === _.pass) { done = true; yield value; yield* iter; return; }

      if (result != null) {
        const it = Iter.getIter(result);
        if (it) yield* it; else yield result;
      }

      ++idx;
    }
  } finally {
    if (!done && iter.return) iter.return();
  }
});

Iter.chain_(function* mapTo(iter, to, ...funcs) {
  const l = _._mappingFuncs(funcs, false);
  if (!l) { yield* iter; return; }

  if (typeof to !== 'function') {
    if (to instanceof Array) to = _.to_(...to);
    else to = _.to_(to);
  }

  let value, done;
  const resFunc = l === 1 ? funcs[0] : _.cascadeFunc.bind(this, funcs);
  const desc = {iter, ctx: this};
  let idx = 0;

  try {
    while ({value, done} = iter.next(), !done) {
      const result = resFunc.call(this, value, idx, desc, value);
      if (result === _.stop) return;
      if (result === _.pass) { done = true; yield value; yield* iter; return; }

      const p = to.call(this, value, idx, desc, value);
      if (p) p.ctx[p.key] = result;
      yield value;
      ++idx;
    }
  } finally {
    if (!done && iter.return) iter.return();
  }
});

Iter.chain_(function mapAt(iter, at, ...funcs) {
  let ato, ain;
  if (at instanceof Array) { ato = _.to_(...at); ain = _.in_(...at); }
  else { ato = _.to_(at); ain = _.in_(at); }
  return Iter.mapTo.gen.call(this, iter, ato, ain, ...funcs);
});

Iter.chain_(function mapKey(iter, ...funcs) {
  return Iter.mapAt.gen.call(this, iter, 0, ...funcs);
});

Iter.chain_(function mapValue(iter, ...funcs) {
  return Iter.mapAt.gen.call(this, iter, 1, ...funcs);
});

Iter.chain_(function mapKeys(iter, ...funcs) {
  return Iter.mapTo.gen.call(this, iter, 0, ...funcs);
});

Iter.chain_(function mapValues(iter, ...funcs) {
  return Iter.mapTo.gen.call(this, iter, 1, ...funcs);
});

Iter.chain_(function* gen(iter, func, ...args) {
  yield* func.call(this, iter, ...args);
});

module.exports = Iter;
