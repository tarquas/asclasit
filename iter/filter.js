const Iter = require('./base');
const $ = require('../func');

const {chain_} = Iter;

chain_(function* filter(iter, ...funcs) {
  const l = $._predicateFuncs(funcs);

  if (!l) {
    for (const item of iter) {
      if (item) yield item;
    }

    return;
  }

  const desc = {iter, ctx: this};

  if (l === 1) {
    const func = funcs[0];

    for (const item of iter) {
      if (func.call(this, item, desc)) yield item;
    }
  } else {
    for (const item of iter) {
      let v = item;

      for (const func of funcs) {
        v = func.call(this, v, item, desc);
      }

      if (v) yield item;
    }
  }
});

chain_(function* skip(iter, ...funcs) {
  yield* Iter.filter.gen.call(this, iter, ...funcs, $.not);
});

chain_(function* take(iter, ...funcs) {
  const l = $._predicateFuncs(funcs);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};

  if (l === 1) {
    const func = funcs[0];

    for (const item of iter) {
      if (!func.call(this, item, item, desc)) break;
      yield item;
    }
  } else {
    for (const item of iter) {
      let v = item;

      for (const func of funcs) {
        v = func.call(this, v, item, desc);
      }

      if (!v) break;
      yield item;
    }
  }
});

module.exports = Iter;
