const Iter = require('./map');
const $ = require('../func');

test('Iter_.map: map iterator: echo', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map();
  expect(Array.from(wrapped)).toEqual([4, 0, 8, 3, 1]);
});

test('Iter_.map: map falsy', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map(false);
  expect(Array.from(wrapped)).toEqual([false, true, false, false, false]);
});

test('Iter_.map: map not nully', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, , null, 1]));
  wrapped.map(true);
  expect(Array.from(wrapped)).toEqual([true, true, false, false, true]);
});

test('Iter_.map: map nully', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, , null, 1]));
  wrapped.map(null);
  expect(Array.from(wrapped)).toEqual([false, false, true, true, false]);
});

test('Iter_.map: map iterator: 1 function', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map(v => -v);
  expect(Array.from(wrapped)).toEqual([-4, -0, -8, -3, -1]);
});

test('Iter_.map: stop: 1 function', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map(v => v > 6 ? $.stop : -v);
  expect(Array.from(wrapped)).toEqual([-4, -0]);
});

test('Iter_.map: pass: 1 function', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map(v => v > 6 ? $.pass : -v);
  expect(Array.from(wrapped)).toEqual([-4, -0, 8, 3, 1]);
});

test('Iter_.map: stop: several functions', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map($.neg, v => v < -6 ? $.stop : v);
  expect(Array.from(wrapped)).toEqual([-4, -0]);
});

test('Iter_.map: pass: several functions', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map($.neg, v => v < -6 ? $.pass : v);
  expect(Array.from(wrapped)).toEqual([-4, -0, 8, 3, 1]);
});

test('Iter_.map: map iterator: several functions', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map(v => v + v, v => -v);
  expect(Array.from(wrapped)).toEqual([-8, -0, -16, -6, -2]);
});

test('Iter_.map: stretch', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8]));
  wrapped.map(3);
  expect(Array.from(wrapped)).toEqual([[4, 4, 4], [0, 0, 0], [8, 8, 8]]);
});

test('Iter_.map: map and lag', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, [8, 9], 3, 1]));
  wrapped.map(-2);
  expect(Array.from(wrapped)).toEqual([, , 4, 0, [8, 9]]);
});

test('Iter_.maps: map multi iterator: echo', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.maps();
  expect(Array.from(wrapped)).toEqual([4, 0, 8, 3, 1]);
});

test('Iter_.maps: map multi iterator', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.maps(v => v + v, v => -v, v => !v ? null : v < -6 ? [v, -v] : v);
  expect(Array.from(wrapped)).toEqual([-8, 8, -16, 16, -6, -2]);
});

test('Iter_.maps: stretch', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.maps(2);
  expect(Array.from(wrapped)).toEqual([4, 4, 0, 0, 8, 8, 3, 3, 1, 1]);
});

test('Iter_.maps: map multi and skip last', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, [8, 9], 3, 1]));
  wrapped.maps(-2);
  expect(Array.from(wrapped)).toEqual([4, 0, 8, 9]);
});

test('Iter_.maps: stop: several functions', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.maps($.neg, v => v < -6 ? $.stop : [v, 0]);
  expect(Array.from(wrapped)).toEqual([-4, 0, -0, 0]);
});

test('Iter_.maps: pass: several functions', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.maps($.neg, v => v < -6 ? $.pass : [v, 0]);
  expect(Array.from(wrapped)).toEqual([-4, 0, -0, 0, 8, 3, 1]);
});

test('Iter_.mapTo: map to entry: echo', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.mapTo();
  expect(Array.from(wrapped)).toEqual([4, 0, 8, 3, 1]);
});

test('Iter_.mapTo: map to inwalk', () => {
  const wrapped = new Iter(Iter.getIter([[{a: [4]}, 1], [{a: [8]}, 2], [, 4], null]));
  wrapped.mapTo([0, 'a', 0], a => a && a[1] ? a[1] + 1 : 'def');
  expect(Array.from(wrapped)).toEqual([[{a: [2]}, 1], [{a: [3]}, 2], [{a: [5]}, 4], null]);
});

test('Iter_.mapTo: stop: several functions', () => {
  const wrapped = new Iter(Iter.getIter([[4], [0], [8], [3], [1]]));
  wrapped.mapTo(0, '0', $.neg, v => v < -6 ? $.stop : v);
  expect(Array.from(wrapped)).toEqual([[-4], [-0]]);
});

test('Iter_.mapTo: pass: several functions', () => {
  const wrapped = new Iter(Iter.getIter([[4], [0], [8], [3], [1]]));
  wrapped.mapTo(0, '0', $.neg, v => v < -6 ? $.pass : v);
  expect(Array.from(wrapped)).toEqual([[-4], [-0], [8], [3], [1]]);
});

test('Iter_.mapAt: map by field', () => {
  const wrapped = new Iter(Iter.getIter([['a', 1], ['b', 2], ['c', 4], null]));
  wrapped.mapAt(0, key => key ? key.toString().toUpperCase() : 'def');
  expect(Array.from(wrapped)).toEqual([['A', 1], ['B', 2], ['C', 4], null]);
});

test('Iter_.mapAt: map by inwalk', () => {
  const wrapped = new Iter(Iter.getIter([[{a: [4]}, 1], [{a: [8]}, 2], [, 4], null]));
  wrapped.mapAt([0, 'a', 0], key => key ? key.toString() : 'def');
  expect(Array.from(wrapped)).toEqual([[{a: ['4']}, 1], [{a: ['8']}, 2], [{a: ['def']}, 4], null]);
});

test('Iter_.mapKeys: map key in entries', () => {
  const wrapped = new Iter(Iter.getIter([[4, 1], [8, 2]]));
  wrapped.mapKeys(([key]) => key.toString());
  expect(Array.from(wrapped)).toEqual([['4', 1], ['8', 2]]);
});

test('Iter_.mapValues: map value in entries', () => {
  const wrapped = new Iter(Iter.getIter([[4, 1], [8, 2]]));
  wrapped.mapValues(([, value]) => value.toString());
  expect(Array.from(wrapped)).toEqual([[4, '1'], [8, '2']]);
});

test('Iter_.mapKey: map key in entries', () => {
  const wrapped = new Iter(Iter.getIter([[4, 1], [8, 2]]));
  wrapped.mapKey((key) => key.toString());
  expect(Array.from(wrapped)).toEqual([['4', 1], ['8', 2]]);
});

test('Iter_.mapValue: map value in entries', () => {
  const wrapped = new Iter(Iter.getIter([[4, 1], [8, 2]]));
  wrapped.mapValue((value) => value.toString());
  expect(Array.from(wrapped)).toEqual([[4, '1'], [8, '2']]);
});

test('Iter_.gen: apply generator', () => {
  const wrapped = new Iter(Iter.getIter([1, 2, 3]));
  wrapped.gen(function* (iter, arg) { for (const item of iter) yield `${arg}${item}`; }, 'z');
  expect(Array.from(wrapped)).toEqual(['z1', 'z2', 'z3']);
});

test('Iter_.save, Iter_.load: save/load items', () => {
  const wrap = new Iter(Iter.getIter([1, 2, 3]));
  const strs = [];
  const sqrs = Array.from(wrap.save(1).map(v => v.toString()).map(v => strs.push(v)).load(1).map(v => v*v));
  expect(strs).toEqual(['1', '2', '3']);
  expect(sqrs).toEqual([1, 4, 9]);
});
