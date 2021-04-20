const AsIt = require('./base');
const $ = require('../func/map');

const {chain_} = AsIt;

chain_(async function* map(iter, ...funcs) {
  const desc = {iter, ctx: this};
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

chain_(function mapAt(iter, at, ...funcs) {
  if (!(at instanceof Array)) at = [at];
  return AsIt.mapTo.gen(iter, $.to_(...at), $.in_(...at), ...funcs);
});

chain_(function mapKeys(iter, ...funcs) {
  return AsIt.mapAt.gen(iter, 0, ...funcs);
});

chain_(function mapValues(iter, ...funcs) {
  return AsIt.mapAt.gen(iter, 1, ...funcs);
});

module.exports = AsIt;