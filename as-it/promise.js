const AsIt = require('./realign');
require('./make');
require('./value');
const $ = require('../func');

AsIt.chain_(async function* race(iter, chunk = Infinity, ...args) {
  const buf = $();
  let latch = chunk;
  let nBuf = 0;
  let idx = 0;

  if (iter[Symbol.iterator]) {
    for (let item of iter) {
      if (!(item instanceof Array)) item = [idx++, item];
      let [k, v] = item;

      if (latch) {
        latch--;
        nBuf++;
      } else {
        const winner = await $.race(buf);
        yield winner;
        delete buf[winner[0]];
      }

      if (typeof v === 'function') v = v.call(this, ...args);
      buf[k] = v;
    }
  } else {
    for await (let item of iter) {
      if (!(item instanceof Array)) item = [idx++, item];
      let [k, v] = item;

      if (latch) {
        latch--;
        nBuf++;
      } else {
        const winner = await $.race(buf);
        yield winner;
        delete buf[winner[0]];
      }

      if (typeof v === 'function') v = v.call(this, ...args);
      buf[k] = v;
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
