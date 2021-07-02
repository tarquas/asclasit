const AsIt = require('./base');
const $ = require('../func/map');

AsIt.chain_(async function* map(iter, ...funcs) {
  const l = $._mappingFuncs(funcs, false);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};
  let idx = 0;

  if (l === 1) {
    const func = funcs[0];

    for await (const item of iter) {
      yield await func.call(this, item, idx, desc);
      idx++;
    }
  } else {
    for await (const item of iter) {
      let v = item;

      for (const func of funcs) {
        v = await func.call(this, v, idx, desc);
      }

      yield v;
      idx++;
    }
  }
});

AsIt.chain_(async function* maps(iter, ...funcs) {
  const l = $._mappingFuncs(funcs, true);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};
  let idx = 0;

  for await (const item of iter) {
    let v = item;

    for (const func of funcs) {
      v = await func.call(this, v, idx, desc, item);
    }

    idx++;
    if (v == null) continue;
    const it = AsIt.getIter(v);
    if (it) yield* it; else yield v;
  }
});

AsIt.chain_(async function* mapTo(iter, to, ...funcs) {
  const l = $._mappingFuncs(funcs, false);
  if (!l) return yield* iter;

  if (typeof to !== 'function') {
    if (to instanceof Array) to = $.to_(...to);
    else to = $.to_(to);
  }

  const desc = {iter, ctx: this};
  let idx = 0;

  for await (const item of iter) {
    let v = item;

    for (const func of funcs) {
      v = await func.call(this, v, idx, desc);
    }

    const p = await to.call(this, item, idx, desc);
    if (p) p.ctx[p.key] = v;

    yield item;
    idx++;
  }
});

AsIt.chain_(function mapAt(iter, at, ...funcs) {
  let ato, ain;
  if (at instanceof Array) { ato = $.to_(...at); ain = $.in_(...at); }
  else { ato = $.to_(at); ain = $.in_(at); }
  return AsIt.mapTo.gen(iter, ato, ain, ...funcs);
});

AsIt.chain_(function mapKey(iter, ...funcs) {
  return AsIt.mapAt.gen(iter, 0, ...funcs);
});

AsIt.chain_(function mapValue(iter, ...funcs) {
  return AsIt.mapAt.gen(iter, 1, ...funcs);
});

AsIt.chain_(function mapKeys(iter, ...funcs) {
  return AsIt.mapTo.gen(iter, 0, ...funcs);
});

AsIt.chain_(function mapValues(iter, ...funcs) {
  return AsIt.mapTo.gen(iter, 1, ...funcs);
});

AsIt.chain_(async function* gen(iter, func, ...args) {
  yield* func.call(this, iter, ...args);
});

module.exports = AsIt;
