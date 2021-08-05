const AsIt = require('./base');
const $ = require('../func');

async function* filterGen(iter, double, ...funcs) {
  const l = $._predicateFuncs(funcs);

  if (!l) {
    for await (const item of iter) {
      if (item) yield item;
    }

    return;
  }

  const desc = {iter, ctx: this};
  let pass = false;

  if (l === 1) {
    const func = funcs[0];

    for await (const item of iter) {
      if (pass) { yield item; continue; }

      let v = await func.call(this, item, item, desc);
      if (v === $.stop) break;
      if (v === $.pass) { pass = true; yield item; continue; }

      if (v) yield item;
      if (!double) continue;

      v = await func.call(this, item, item, desc);
      if (v === $.stop) break;
      if (v === $.pass) { pass = true; yield item; continue; }
    }
  } else {
    for await (const item of iter) {
      if (pass) { yield item; continue; }

      let v = item;
      for (const func of funcs) {
        v = await func.call(this, v, item, desc);
      }
      if (v === $.stop) return;
      if (v === $.pass) { pass = true; yield item; continue; }

      if (v) yield item;
      if (!double) continue;

      v = item;
      for (const func of funcs) {
        v = await func.call(this, v, item, desc);
      }
      if (v === $.stop) return;
      if (v === $.pass) { pass = true; yield item; continue; }
    }
  }
}

AsIt.chain_(async function* filter(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs);
});

AsIt.chain_(async function* dfilter(iter, ...funcs) {
  yield* filterGen.call(this, iter, true, ...funcs);
});

AsIt.chain_(async function* call(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs, $.true);
});

AsIt.chain_(async function* debug(iter, ...funcs) {
  $._predicateFuncs(funcs);

  funcs = funcs.map((func) => function (item) {
    return func.call(this, item);
  });

  yield* filterGen.call(this, iter, false, ...funcs, $.true);
});

AsIt.chain_(async function* skip(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs, $.cond_(false, $.pass));
});

AsIt.chain_(async function* take(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs, $.cond_(true, $.stop));
});

AsIt.chain_(async function* stop(iter, ...funcs) {
  yield* filterGen.call(this, iter, true, ...funcs, $.cond_($.stop, true));
});

module.exports = AsIt;
