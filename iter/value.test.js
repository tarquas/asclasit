const Iter = require('./value');

test('Iter_.array: grab to array', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  const array = wrapped.array();
  expect(array).toEqual([2, 6, 7]);
});

test('Iter_.set: grab to set', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  const set = wrapped.set();
  expect(Array.from(set)).toEqual([2, 6, 7]);
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
