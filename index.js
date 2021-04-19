const $ = require('./base');

require('./func');
const Iter = require('./iter');
const AsIt = require('./as-it');

Iter.value_(function toAsIt(iter) {
  return new AsIt(iter);
});

$.func_(Iter.objectsKeys, 'keys');
$.func_(Iter.objectsValues, 'values');
$.func_(Iter.objectsEntries, 'entries');

Object.assign($, {Iter, AsIt});

module.exports = $;
