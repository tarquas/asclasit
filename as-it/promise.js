const AsIt = require('./realign');
require('./make');
require('./value');
const Iter = require('../iter');
const $ = require('../func');

const {value_} = AsIt;

value_(async function promise(iter, reduce, func) {
  const desc = {iter, ctx: this};
  const keys = [];
  const promises = [];
  let isObj = false;
  let idx = 0;

  for await (const item of iter) {
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

  const values = await reduce.call(this, promises);

  if (isObj) {
    const zip = Iter.zip.gen(keys, values);
    const chunk = Iter.chunk.gen(zip, 2);
    const obj = Iter.toObject(chunk);
    return obj;
  }

  return values;
});

value_(async function all(iter, func) {
  return await AsIt.promise.call(this, iter, $.promiseAll, func);
});

module.exports = AsIt;
