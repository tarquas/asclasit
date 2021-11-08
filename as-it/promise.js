const AsIt = require('./realign');
require('./make');
require('./value');
const $ = require('../func');

AsIt.chain_(async function* race(iter, chunk = Infinity, ...funcs) {
  const buf = $();
  let latch = chunk - 1;
  let nBuf = 0;
  let idx = 0;
  const desc = {buf, ctx: this, chunk};

  $._predicateFuncs(funcs);

  if (iter[Symbol.iterator]) {
    for (let item of iter) {
      if (!(item instanceof Array)) item = [idx++, item];
      let [k, v] = item;

      for (const func of funcs) v = func.call(this, v, k, desc);
      buf[k] = v;

      if (latch) {
        latch--;
        nBuf++;
      } else {
        const winner = await $.race(buf);
        yield winner;
        delete buf[winner[0]];
      }
    }
  } else {
    for await (let item of iter) {
      if (!(item instanceof Array)) item = [idx++, item];
      let [k, v] = item;

      for (const func of funcs) v = func.call(this, v, k, desc);
      buf[k] = v;

      if (latch) {
        latch--;
        nBuf++;
      } else {
        const winner = await $.race(buf);
        yield winner;
        delete buf[winner[0]];
      }
    }
  }

  while (nBuf) {
    const winner = await $.race(buf);
    yield winner;
    delete buf[winner[0]];
    nBuf--;
  }
});

module.exports = AsIt;
