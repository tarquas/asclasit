const Iter = require('./value');

test('Iter_.toArray: grab to array', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  const array = wrapped.toArray();
  expect(array).toEqual([2, 6, 7]);
});

test('Iter_.toSet: grab to set', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  const set = wrapped.toSet();
  expect(Array.from(set)).toEqual([2, 6, 7]);
});

test('Iter_.toObject: get object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 2], 'c', null][Symbol.iterator]());
  expect(entries.toObject(true)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.toMap: get map from entries', () => {
  const entries = new Iter([['a', 1], ['b', 2], 'c', null][Symbol.iterator]());
  const map = entries.toMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: 1, b: 2, c: true, null: true});
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
