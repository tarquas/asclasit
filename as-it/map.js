const AsIt = require('./base');
const $ = require('../func/map');

const {chain_, short_} = AsIt;

chain_(async function* map(iter, ...funcs) {
  const desc = {it: iter, iter: this};
  let idx = 0;

  if (!funcs.length) {
    yield* iter;
  } else if (funcs.length === 1) {
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

chain_(async function* mapTo(iter, to, ...funcs) {
  const desc = {it: iter, iter: this};
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

short_(function mapAt(at, ...funcs) {
  if (!(at instanceof Array)) at = [at];
  return this.mapTo($.to_(...at), $.in_(...at), ...funcs);
});

short_(function mapKey(...funcs) {
  return this.mapAt(0, ...funcs);
});

module.exports = AsIt;
