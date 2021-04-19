const Iter = require('./value');

test('Iter_.appendArray: tee to array', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const array = [];
  wrapped.appendArray(array);
  expect(Array.from(wrapped)).toEqual([2, 6, 7, 6]);
  expect(array).toEqual([2, 6, 7, 6]);
});

test('Iter_.toArray: grab to array', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const array = wrapped.toArray();
  expect(array).toEqual([2, 6, 7, 6]);
});

test('Iter_.toArray: append to array', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = [];
  expect(wrapped.toArray(to)).toBe(to);
  expect(to).toEqual([2, 6, 7, 6]);
});

test('Iter_.appendSet: tee to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  wrapped.appendSet(to);
  expect(Array.from(wrapped)).toEqual([2, 6, 7, 6]);
  expect(Array.from(to)).toEqual([2, 6, 7]);
});

test('Iter_.toSet: grab to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const set = wrapped.toSet();
  expect(Array.from(set)).toEqual([2, 6, 7]);
});

test('Iter_.toSet: append to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  expect(wrapped.toSet(to)).toBe(to);
  expect(Array.from(to)).toEqual([2, 6, 7]);
});

test('Iter_.appendXorSet: tee and xor to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  wrapped.appendXorSet(to);
  expect(Array.from(wrapped)).toEqual([true, true, true, false]);
  expect(Array.from(to)).toEqual([2, 7]);
});

test('Iter_.appendXorSet: only detect xor operations', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  wrapped.appendXorSet();
  expect(Array.from(wrapped)).toEqual([true, true, true, false]);
});

test('Iter_.toXorSet: xor to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const set = wrapped.toXorSet();
  expect(Array.from(set)).toEqual([2, 7]);
});

test('Iter_.appendObject: tee object from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = Object.create(null);
  wrapped.appendObject(to, true);
  expect(Object.fromEntries(wrapped)).toEqual({a: 1, b: 2, c: true, null: true});
  expect(to).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.toObject: get object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  expect(entries.toObject(true)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.toObject: get object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  expect(entries.toObject(null, true)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.appendXorObject: tee and xor to object from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = Object.create(null);
  wrapped.appendXorObject(to, true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
  expect(to).toEqual({a: 1, c: true, null: true});
});

test('Iter_.appendXorObject: only detect xor operations', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorObject(true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
});

test('Iter_.appendXorObject: only detect xor operations', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorObject(null, true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
});

test('Iter_.toXorObject: xor to object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], 'c', null][Symbol.iterator]());
  expect(entries.toXorObject(true)).toEqual({a: 1, null: true});
});

test('Iter_.toXorObject: xor to object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], 'c', null][Symbol.iterator]());
  expect(entries.toXorObject(null, true)).toEqual({a: 1, null: true});
});

test('Iter_.appendMap: tee map from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = new Map();
  wrapped.appendMap(to, true);
  expect(Object.fromEntries(wrapped)).toEqual({a: 1, b: 2, c: true, null: true});
  expect(Object.fromEntries(to)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.toMap: get map from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const map = entries.toMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.appendXorMap: tee and xor to map from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = new Map();
  wrapped.appendXorMap(to, true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
  expect(Object.fromEntries(to)).toEqual({a: 1, c: true, null: true});
});

test('Iter_.appendXorMap: only detect xor operations', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorMap(true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
});

test('Iter_.toXorMap: xor to map from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], 'a', null, 'a'][Symbol.iterator]());
  const map = entries.toXorMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: true, c: true, null: true});
});

test('Iter_.count: count iterator items', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  expect(wrapped.count()).toEqual(3);
});

test('Iter_.exec: execute iterator', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  expect(wrapped.exec()).toEqual(undefined);
});

test('Iter_.first: empty', () => {
  const wrapped = new Iter([][Symbol.iterator]());
  expect(wrapped.first()).toEqual(undefined);
});

test('Iter_.first: get only first item', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  expect(wrapped.first()).toEqual(2);
});

test('Iter_.last: get only last item', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  expect(wrapped.last()).toEqual(7);
});

test('Iter_.toIter: duplicate iter', () => {
  const from = new Iter([1, 2, 3][Symbol.iterator]());
  const to = from.toIter();
  expect(to !== from).toBe(true);
  expect(to instanceof Iter).toBe(true);
  expect(Array.from(to)).toEqual([1, 2, 3]);
});
