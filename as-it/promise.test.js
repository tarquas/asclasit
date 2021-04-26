const AsIt = require('./promise');
require('./make');
const $ = require('../func');

test('AsIt_.all: Promise.all: array', async () => {
  const all = await AsIt.all([1, 2, 3], async v => v + 1);
  expect(all).toEqual([2, 3, 4]);
});

test('AsIt_.all: Promise.all: object', async () => {
  const all = await AsIt.all([1, ['a', 2], 3], async v => v + 1);
  expect(all).toEqual({0: 2, a: 3, 2: 4});
});

test('AsIt_.all: Promise.all: as-is', async () => {
  const all = await AsIt.from([1, 2, 3]).map(async v => v + 1).all();
  expect(all).toEqual([2, 3, 4]);
});
