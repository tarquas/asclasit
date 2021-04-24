const AsIt = require('./base');
const $ = require('../func');

const {chain_} = AsIt;

chain_(async function* filter(iter, ...funcs) {
  const l = $._predicateFuncs(funcs);

  if (!l) {
    for await (const item of iter) {
      if (item) yield item;
    }

    return;
  }

  const desc = {iter, ctx: this};

  if (l === 1) {
    const func = funcs[0];

    for await (const item of iter) {
      if (await func.call(this, item, desc)) yield item;
    }
  } else {
    for await (const item of iter) {
      let v = item;

      for (const func of funcs) {
        v = await func.call(this, v, item, desc);
      }

      if (v) yield item;
    }
  }
});

chain_(async function* skip(iter, ...funcs) {
  yield* AsIt.filter.gen.call(this, iter, ...funcs, $.not);
});

chain_(async function* take(iter, ...funcs) {
  const l = $._predicateFuncs(funcs);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};

  if (l === 1) {
    const func = funcs[0];

    for await (const item of iter) {
      if (!await func.call(this, item, item, desc)) break;
      yield item;
    }
  } else {
    for await (const item of iter) {
      let v = item;

      for await (const func of funcs) {
        v = await func.call(this, v, item, desc);
      }

      if (!v) break;
      yield item;
    }
  }
});

module.exports = AsIt;
