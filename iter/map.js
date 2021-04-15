const Iter = require('./base');
const $ = require('../func/map');

const {chain_, short_} = Iter;

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

short_(function mapAt(at, ...funcs) {
  if (!(at instanceof Array)) at = [at];
  return this.mapTo($.to_(...at), $.in_(...at), ...funcs);
});

short_(function mapKey(...funcs) {
  return this.mapAt(0, ...funcs);
});

module.exports = Iter;
