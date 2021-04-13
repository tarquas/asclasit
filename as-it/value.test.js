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

test('AsIt_.count: count iterator items', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  expect(await wrapped.count()).toEqual(3);
});

test('AsIt_.exec: execute iterator', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  expect(await wrapped.exec()).toEqual(undefined);
});

test('AsIt_.first: empty', async () => {
  const wrapped = new AsIt([][Symbol.iterator]());
  expect(await wrapped.first()).toEqual(undefined);
});

test('AsIt_.first: get only first item', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  expect(await wrapped.first()).toEqual(2);
});

test('AsIt_.last: get only last item', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  expect(await wrapped.last()).toEqual(7);
});
