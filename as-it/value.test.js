const AsIt = require('./value');

test('AsIt_.array: grab to array', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  const array = await wrapped.array();
  expect(array).toEqual([2, 6, 7]);
});

test('AsIt_.set: grab to set', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  const set = await wrapped.set();
  expect(Array.from(set)).toEqual([2, 6, 7]);
});
