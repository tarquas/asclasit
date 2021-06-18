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

$.func_(function pure(obj, ...parts) {
  if (obj != null) Object.setPrototypeOf(obj, null);
  else obj = Object.create(null);
  if (parts.length) Iter.from(parts).toObject(obj);
  return obj;
});

Object.assign($, {Iter, AsIt});

module.exports = $;
