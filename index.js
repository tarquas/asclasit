const $ = require('./base');

require('./func');
const Iter = require('./iter');
const AsIt = require('./as-it');

Iter.AsIt = AsIt;
AsIt.Iter = Iter;

Object.defineProperty(Iter.prototype, 'AsIt', {get() { return this.$.AsIt; }});
Object.defineProperty(AsIt.prototype, 'Iter', {get() { return this.$.Iter; }});

Iter.value_(function toAsIt(iter) {
  return new this.AsIt(iter);
});

Iter.value_(function pipe(iter, to, opts) {
  const stream = this.$.stream.call(this, iter, to, opts);
  return new this.AsIt(stream);
});

Iter.value_(function pipes(iter, to, opts) {
  const stream = this.$.streams.call(this, iter, to, opts);
  return new this.AsIt(stream);
});

Iter.value_(function race(iter, chunk, ...args) {
  const asIt = AsIt.race.gen.call(this, iter, chunk, ...args);
  return new this.AsIt(asIt);
});

$.func_(Iter.objectsKeys.bind(Iter), 'keys');
$.func_(Iter.objectsValues.bind(Iter), 'values');
$.func_(Iter.objectsEntries.bind(Iter), 'entries');

$.func_(function pure(obj, ...parts) {
  if (obj != null) Object.setPrototypeOf(obj, null);
  else obj = Object.create(null);
  if (parts.length) Iter.from(parts).toObject(obj);
  return obj;
});

Object.assign($, {Iter, AsIt});

require('./func2');

module.exports = $;
