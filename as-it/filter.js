const AsIt = require('./base');
const $ = require('../func');

AsIt.chain_(async function* filter(iter, ...funcs) {
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

AsIt.chain_(async function* call(iter, ...funcs) {
  yield* AsIt.filter.gen.call(this, iter, ...funcs, true);
});

AsIt.chain_(async function* debug(iter, ...funcs) {
  $._predicateFuncs(funcs);

  funcs = funcs.map((func) => function (item) {
    return func.call(this, item);
  });

  yield* AsIt.filter.gen.call(this, iter, ...funcs, true);
});

AsIt.chain_(async function* skip(iter, ...funcs) {
  yield* AsIt.filter.gen.call(this, iter, ...funcs, $.not);
});

AsIt.chain_(async function* take(iter, ...funcs) {
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
