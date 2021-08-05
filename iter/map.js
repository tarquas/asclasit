const Iter = require('./base');
const $ = require('../func/map');

Iter.chain_(function* map(iter, ...funcs) {
  const l = $._mappingFuncs(funcs, false);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};
  let idx = 0;
  let pass = false;

  if (l === 1) {
    const func = funcs[0];

    for (const item of iter) {
      if (pass) { yield item; continue; }
      const v = func.call(this, item, idx, desc, item);
      if (v === $.stop) return;
      if (v === $.pass) { pass = true; yield item; continue; }
      yield v;
      idx++;
    }
  } else {
    for (const item of iter) {
      if (pass) { yield item; continue; }
      let v = item;

      for (const func of funcs) {
        v = func.call(this, v, idx, desc, item);
      }

      if (v === $.stop) return;
      if (v === $.pass) { pass = true; yield item; continue; }
      yield v;
      idx++;
    }
  }
});

Iter.chain_(function* maps(iter, ...funcs) {
  const l = $._mappingFuncs(funcs, true);
  if (!l) return yield* iter;

  const desc = {iter, ctx: this};
  let idx = 0;
  let pass = false;

  for (const item of iter) {
    if (pass) { yield item; continue; }
    let v = item;

    for (const func of funcs) {
      v = func.call(this, v, idx, desc, item);
    }

    if (v === $.stop) return;
    if (v === $.pass) { pass = true; yield item; continue; }
    idx++;
    if (v == null) continue;
    const it = Iter.getIter(v);
    if (it) yield* it; else yield v;
  }
});

Iter.chain_(function* mapTo(iter, to, ...funcs) {
  const l = $._mappingFuncs(funcs, false);
  if (!l) return yield* iter;

  if (typeof to !== 'function') {
    if (to instanceof Array) to = $.to_(...to);
    else to = $.to_(to);
  }

  const desc = {iter, ctx: this};
  let idx = 0;
  let pass = false;

  for (const item of iter) {
    if (pass) { yield item; continue; }
    let v = item;

    for (const func of funcs) {
      v = func.call(this, v, idx, desc, item);
    }

    if (v === $.stop) return;
    if (v === $.pass) { pass = true; yield item; continue; }
    const p = to.call(this, item, idx, desc, item);
    if (p) p.ctx[p.key] = v;

    yield item;
    idx++;
  }
});

Iter.chain_(function mapAt(iter, at, ...funcs) {
  let ato, ain;
  if (at instanceof Array) { ato = $.to_(...at); ain = $.in_(...at); }
  else { ato = $.to_(at); ain = $.in_(at); }
  return Iter.mapTo.gen(iter, ato, ain, ...funcs);
});

Iter.chain_(function mapKey(iter, ...funcs) {
  return Iter.mapAt.gen(iter, 0, ...funcs);
});

Iter.chain_(function mapValue(iter, ...funcs) {
  return Iter.mapAt.gen(iter, 1, ...funcs);
});

Iter.chain_(function mapKeys(iter, ...funcs) {
  return Iter.mapTo.gen(iter, 0, ...funcs);
});

Iter.chain_(function mapValues(iter, ...funcs) {
  return Iter.mapTo.gen(iter, 1, ...funcs);
});

Iter.chain_(function* gen(iter, func, ...args) {
  yield* func.call(this, iter, ...args);
});

module.exports = Iter;
