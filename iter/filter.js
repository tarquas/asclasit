const Iter = require('./base');
const $ = require('../func');

function* filterGen(iter, double, ...funcs) {
  const l = $._predicateFuncs(funcs);

  if (!l) {
    for (const item of iter) {
      if (item) yield item;
    }

    return;
  }

  const desc = {iter, ctx: this};
  let pass = false;

  if (l === 1) {
    const func = funcs[0];

    for (const item of iter) {
      if (pass) { yield item; continue; }

      let v = func.call(this, item, item, desc);
      if (v === $.stop) break;
      if (v === $.pass) { pass = true; yield item; continue; }

      if (v) yield item;
      if (!double) continue;

      v = func.call(this, item, item, desc);
      if (v === $.stop) break;
      if (v === $.pass) { pass = true; yield item; continue; }
    }
  } else {
    for (const item of iter) {
      if (pass) { yield item; continue; }

      let v = item;
      for (const func of funcs) {
        v = func.call(this, v, item, desc);
      }
      if (v === $.stop) break;
      if (v === $.pass) { pass = true; yield item; continue; }

      if (v) yield item;
      if (!double) continue;

      v = item;
      for (const func of funcs) {
        v = func.call(this, v, item, desc);
      }
      if (v === $.stop) break;
      if (v === $.pass) { pass = true; yield item; continue; }
    }
  }
}

Iter.chain_(function* filter(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs);
});

Iter.chain_(function* dfilter(iter, ...funcs) {
  yield* filterGen.call(this, iter, true, ...funcs);
});

Iter.chain_(function* call(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs, $.true);
});

Iter.chain_(function* debug(iter, ...funcs) {
  $._predicateFuncs(funcs);

  funcs = funcs.map((func) => function (item) {
    return func.call(this, item);
  });

  yield* filterGen.call(this, iter, false, ...funcs, $.true);
});

Iter.chain_(function* skip(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs, $.cond_(false, $.pass));
});

Iter.chain_(function* take(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs, $.cond_(true, $.stop));
});

Iter.chain_(function* stop(iter, ...funcs) {
  yield* filterGen.call(this, iter, true, ...funcs, $.cond_($.stop, true));
});

module.exports = Iter;
