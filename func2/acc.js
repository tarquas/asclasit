const $ = require('../base');
const Iter = require('../iter/base');

const {func_} = $;

func_(function accObject(to, from) {
  if (typeof from === 'object') return Object.assign(to, from);
  if (to[from]) return to[from]++;
  return to[from] = 1;
});

func_(function accArray(to, from) {
  const iter = Iter.getIter(from);
  if (iter) for (const item of iter) to.push(item);
  else to.push(from);
  return to;
});

func_(function accSet(to, from) {
  const iter = Iter.getIter(from);
  if (iter) for (const item of iter) to.add(item);
  else to.add(from);
  return to;
});

func_(function accMap(to, from) {
  const iter = Iter.getIter(from);
  if (iter) for (const item of iter) to.set(item, true);
  else to.set(from, true);
  return to;
});

func_(function accDate(to, from) {
  if (Number.isInteger(from)) to.setTime(to.getTime() + from);
  else to.setTime(from == null ? new Date() : new Date(from));
  return to;
});

$.accumulators = new Map([
  [null, $.accObject],
  [Object, $.accObject],
  [Array, $.accArray],
  [Set, $.accSet],
  [Map, $.accMap],
  [WeakSet, $.accSet],
  [WeakMap, $.accMap],
  [Date, $.accDate],
]);

$.accInit = new Map([
  [null, () => Object.create(null)],
  [Object, () => ({})],
  [Array, () => []],
  [Set, () => new Set()],
  [Map, () => new Map()],
  [WeakSet, () => new WeakSet()],
  [WeakMap, () => new WeakMap()],
  [Date, () => new Date()],
]);

func_(function initAcc(obj) {
  if (obj == null || typeof obj !== 'object') return new Set();
  const ctor = obj.constructor;
  const init = $.accInit.get(ctor);
  if (init) return init();
  return Object.create(null);
});

func_(function accumulate(to, ...from) {
  if (to == null || typeof to !== 'object') return to;
  const ctor = to.constructor;
  const acc = ctor ? $.accumulators.get(ctor) || $.accObject : $.accObject;
  for (const item of from) acc.call(this, to, item);
  return to;
});

func_($.accumulate, 'acc');

module.exports = $;
