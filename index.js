const $ = require('./base');
require('./func');
const Iter = require('./iter');
const AsIt = require('./as-it');

Iter.value_(function toIter(it) {
  return new Iter(it);
});

Iter.value_(function toAsIt(iter) {
  return new AsIt(iter);
});

$.func_(Iter.objectsKeys, 'keys');
$.func_(Iter.objectsValues, 'values');
$.func_(Iter.objectsEntries, 'entries');

AsIt.value_(function toAsIt(it) {
  return new AsIt(it);
});

AsIt.value_(async function toIter() {
  const arr = await this.toArray();
  return Iter.from(arr);
});

Object.assign($, {Iter, AsIt});

module.exports = $;
