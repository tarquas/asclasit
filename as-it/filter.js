const AsIt = require('./base');
const _ = require('../func');

async function* filterGen(iter, double, ...funcs) {
  const l = _._predicateFuncs(funcs);

  if (!l) {
    for await (const item of iter) {
      if (item) yield item;
    }

    return;
  }

  let value, done;
  const resFunc = l === 1 ? funcs[0] : _.cascadeFuncAsync.bind(this, funcs);
  const desc = {iter, ctx: this};

  try {
    if (double < 0) {
      while ({value, done} = await iter.next(), !done) {
        yield value;
        const result2 = await resFunc.call(this, value, value, desc, -1);
        if (result2 === _.stop) return;
        if (result2 === _.pass) { done = true; yield* iter; return; }
      }
    } else if (double) {
      while ({value, done} = await iter.next(), !done) {
        const result = await resFunc.call(this, value, value, desc, false);
        if (result === _.stop) return;
        if (result) yield value;
        if (result === _.pass) { done = true; yield* iter; return; }
        const result2 = await resFunc.call(this, value, value, desc, true);
        if (result2 === _.stop) return;
        if (result2 === _.pass) { done = true; yield* iter; return; }
      }
    } else {
      while ({value, done} = await iter.next(), !done) {
        const result = await resFunc.call(this, value, value, desc, null);
        if (result === _.stop) return;
        if (result) yield value;
        if (result === _.pass) { done = true; yield* iter; return; }
      }
    }
  } finally {
    if (!done && iter.return) await iter.return();
  }
}

AsIt.chain_(async function* filter(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs);
});

AsIt.chain_(async function* dfilter(iter, ...funcs) {
  yield* filterGen.call(this, iter, true, ...funcs);
});

AsIt.chain_(async function* pfilter(iter, ...funcs) {
  yield* filterGen.call(this, iter, -1, ...funcs);
});

AsIt.chain_(async function* call(iter, ...funcs) {
  yield* filterGen.call(this, iter, false, ...funcs, _.true);
});

AsIt.chain_(async function* debug(iter, ...funcs) {
  _._predicateFuncs(funcs);

  funcs = funcs.map((func) => function (item) {
    return func.call(this, item);
  });

  yield* filterGen.call(this, iter, false, ...funcs, _.true);
});

AsIt.chain_(async function* dbglog(iter, ...pre) {
  yield* AsIt.debug.gen.call(this, iter, v => console.log(...pre, v));
});

async function* skipN(iter, n) {
  let done;
  if (n <= 0) { yield* iter; return; }

  try {
    while ({done} = await iter.next(), !done) {
      if (--n <= 0) { yield* iter; return; }
    }
  } finally {
    if (!done && iter.return) await iter.return();
  }
}

AsIt.chain_(async function* skip(iter, ...funcs) {
  if (funcs.length === 1 && typeof funcs[0] === 'number') { yield* skipN(iter, funcs[0]); return; }
  yield* filterGen.call(this, iter, false, ...funcs, _.condSkip);
});

async function* takeN(iter, n) {
  let value, done;

  try {
    if (n <= 0) return;

    while ({value, done} = await iter.next(), !done) {
      yield value;
      if (--n <= 0) return;
    }
  } finally {
    if (!done && iter.return) await iter.return();
  }
}

AsIt.chain_(async function* take(iter, ...funcs) {
  if (funcs.length === 1 && typeof funcs[0] === 'number') { yield* takeN(iter, funcs[0]); return; }
  yield* filterGen.call(this, iter, false, ...funcs, _.condTake);
});

AsIt.chain_(async function* takes(iter, ...funcs) {
  if (funcs.length === 1 && typeof funcs[0] === 'number') { yield* takeN(iter, funcs[0]); return; }
  yield* filterGen.call(this, iter, -1, ...funcs, _.condTake);
});

AsIt.chain_(async function* stop(iter, ...funcs) {
  yield* filterGen.call(this, iter, true, ...funcs, _.condStop);
});

module.exports = AsIt;
