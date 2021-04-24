const Iter = require('./realign');
require('./value');

const {value_} = Iter;

value_(async function all(iter, func) {
  const desc = {iter, ctx: this};
  const keys = [];
  const promises = [];
  let isObj = false;
  let idx = 0;

  for (const item of iter) {
    let k, v;

    if (item instanceof Array) {
      isObj = true;
      ([k, v] = item);
    } else {
      k = idx;
      v = item;
    }

    keys.push(k);
    promises.push(func ? func.call(this, v, k, desc, item) : v);
    idx++;
  }

  const values = await Promise.all(promises);

  if (isObj) {
    const zip = Iter.zip.gen(keys, values);
    const chunk = Iter.chunk.gen(zip, 2);
    const obj = Iter.toObject(chunk);
    return obj;
  }

  return values;
});

module.exports = Iter;
