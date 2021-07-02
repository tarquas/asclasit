const Iter = require('./base');
const $ = require('../func');

Iter.chain_(function* filter(iter, ...funcs) {
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

Iter.chain_(function* call(iter, ...funcs) {
  yield* Iter.filter.gen.call(this, iter, ...funcs, true);
});

Iter.chain_(function* debug(iter, ...funcs) {
  $._predicateFuncs(funcs);

  funcs = funcs.map((func) => function (item) {
    return func.call(this, item);
  });

  yield* Iter.filter.gen.call(this, iter, ...funcs, true);
});

Iter.chain_(function* skip(iter, ...funcs) {
  yield* Iter.filter.gen.call(this, iter, ...funcs, $.not);
});

function* takeWhile(iter, double, ...funcs) {
  const l = $._predicateFuncs(funcs);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};

  if (l === 1) {
    const func = funcs[0];

    for (const item of iter) {
      if (!func.call(this, item, item, desc)) break;
      yield item;
      if (double && !func.call(this, item, item, desc)) break;
    }
  } else {
    for (const item of iter) {
      let v = item;
      for (const func of funcs) {
        v = func.call(this, v, item, desc);
      }
      if (!v) break;

      yield item;

      if (!double) continue;

      v = item;
      for (const func of funcs) {
        v = func.call(this, v, item, desc);
      }
      if (!v) break;
    }
  }
}

Iter.chain_(function* take(iter, ...funcs) {
  yield* takeWhile.call(this, iter, false, ...funcs);
});

Iter.chain_(function* dtake(iter, ...funcs) {
  yield* takeWhile.call(this, iter, true, ...funcs);
});

Iter.chain_(function* stop(iter, ...funcs) {
  yield* takeWhile.call(this, iter, true, ...funcs, $.not);
});

module.exports = Iter;
