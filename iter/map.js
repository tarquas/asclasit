const Iter = require('./base');
const $ = require('../func/map');

const {chain_} = Iter;

chain_(function* map(iter, ...funcs) {
  const desc = {it: iter, iter: this};
  let idx = 0;

  if (!funcs.length) {
    yield* iter;
  } else if (funcs.length === 1) {
    const func = funcs[0];

    for (const item of iter) {
      yield func.call(this, item, idx, desc);
      idx++;
    }
  } else {
    for (const item of iter) {
      let v = item;

      for (const func of funcs) {
        v = func.call(this, v, idx, desc);
      }

      yield v;
      idx++;
    }
  }
});

chain_(function* mapTo(iter, to, ...funcs) {
  const desc = {it: iter, iter: this};
  let idx = 0;

  for (const item of iter) {
    let v = item;

    for (const func of funcs) {
      v = func.call(this, v, idx, desc);
    }

    const p = to.call(this, item, idx, desc);
    if (p) p.ctx[p.key] = v;

    yield item;
    idx++;
  }
});

chain_(function mapAt(iter, at, ...funcs) {
  if (!(at instanceof Array)) at = [at];
  return Iter.mapTo.gen(iter, $.to_(...at), $.in_(...at), ...funcs);
});

chain_(function mapKey(iter, ...funcs) {
  return Iter.mapAt.gen(iter, 0, ...funcs);
});

module.exports = Iter;
