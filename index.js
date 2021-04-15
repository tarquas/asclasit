const $ = require('./base');
require('./func');
const Iter = require('./iter');
const AsIt = require('./as-it');

Iter.value_(function iter(it) {
  return new Iter(it);
});

Iter.value_(function asIt(iter) {
  return new AsIt(iter);
});

AsIt.value_(function asIt(it) {
  return new AsIt(it);
});

AsIt.value_(async function iter() {
  const arr = await this.array();
  return Iter.from(arr);
});

Object.assign($, {Iter, AsIt});

module.exports = $;
