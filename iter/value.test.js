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
