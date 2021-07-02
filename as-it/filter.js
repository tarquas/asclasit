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

async function* takeWhile(iter, double, ...funcs) {
  const l = $._predicateFuncs(funcs);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};

  if (l === 1) {
    const func = funcs[0];

    for await (const item of iter) {
      if (!await func.call(this, item, item, desc)) break;
      yield item;
      if (double && !await func.call(this, item, item, desc)) break;
    }
  } else {
    for await (const item of iter) {
      let v = item;
      for await (const func of funcs) {
        v = await func.call(this, v, item, desc);
      }
      if (!v) break;

      yield item;

      if (!double) continue;

      v = item;
      for await (const func of funcs) {
        v = await func.call(this, v, item, desc);
      }
      if (!v) break;
    }
  }
}

AsIt.chain_(async function* take(iter, ...funcs) {
  yield* takeWhile.call(this, iter, false, ...funcs);
});

AsIt.chain_(async function* dtake(iter, ...funcs) {
  yield* takeWhile.call(this, iter, true, ...funcs);
});

AsIt.chain_(async function* stop(iter, ...funcs) {
  yield* takeWhile.call(this, iter, true, ...funcs, $.not);
});

module.exports = AsIt;
