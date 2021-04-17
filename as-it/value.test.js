const AsIt = require('./value');

test('AsIt_.toArray: grab to array', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  const array = await wrapped.toArray();
  expect(array).toEqual([2, 6, 7]);
});

test('AsIt_.toSet: grab to set', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  const set = await wrapped.toSet();
  expect(Array.from(set)).toEqual([2, 6, 7]);
});

test('Iter_.toObject: get object from entries', async () => {
  const entries = new AsIt([['a', 1], ['b', 2], 'c', null][Symbol.iterator]());
  const object = await entries.toObject(true);
  expect(object).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.toMap: get map from entries', async () => {
  const entries = new AsIt([['a', 1], ['b', 2], 'c', null][Symbol.iterator]());
  const map = await entries.toMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: 1, b: 2, c: true, null: true});
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
