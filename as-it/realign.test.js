const AsIt = require('./realign');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

const toChunk = [1, 2, 3, 4, 5, 6, 7, 8, 9];

test('AsIt_.chunk: infinite count', async () => {
  const wrapped = new AsIt(AsIt.getIter(toChunk));
  wrapped.chunk();
  expect(await asItArray(wrapped)).toEqual([toChunk]);
});

test('AsIt_.chunk: by 3', async () => {
  const wrapped = new AsIt(AsIt.getIter(toChunk));
  wrapped.chunk(3);
  expect(await asItArray(wrapped)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
});

test('AsIt_.chunk: by 4', async () => {
  const wrapped = new AsIt(AsIt.getIter(toChunk));
  wrapped.chunk(4);
  expect(await asItArray(wrapped)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
});

test('AsIt_.chunk: by condition', async () => {
  const wrapped = new AsIt(AsIt.getIter(toChunk));
  wrapped.chunk(async item => item & 2);
  expect(await asItArray(wrapped)).toEqual([[1], [2], [3, 4, 5], [6], [7, 8, 9]]);
});

test('AsIt_.chunk: by condition, limited to 2', async () => {
  const wrapped = new AsIt(AsIt.getIter(toChunk));
  wrapped.chunk(2, item => item & 2);
  expect(await asItArray(wrapped)).toEqual([[1], [2], [3, 4], [5], [6], [7, 8], [9]]);
});

test('AsIt_.chunk: by conditions, limited to 2', async () => {
  const wrapped = new AsIt(AsIt.getIter(toChunk));
  wrapped.chunk(2, item => item & 2, async v => !v);
  expect(await asItArray(wrapped)).toEqual([[1, 2], [3], [4], [5, 6], [7], [8], [9]]);
});

const deepArray = [
  [[1, 2], ['3a', 4]],
  '5a',
  [[[6, '7a'], 8], 9],
];

const deepFlattened = [1, 2, '3a', 4, '5a', 6, '7a', 8, 9];

test('AsIt_.flatten: default depth 1', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten();
  expect(await asItArray(wrapped)).toEqual([[1, 2], ['3a', 4], '5a', [[6, '7a'], 8], 9]);
});

test('Iter_.flatten: as-is depth 0', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(0);
  expect(await asItArray(wrapped)).toEqual(deepArray);
});

test('Iter_.flatten: infinite depth < 0', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(-1);
  expect(await asItArray(wrapped)).toEqual(deepFlattened);
});

test('Iter_.flatten: infinite depth Infinity', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(Infinity);
  expect(await asItArray(wrapped)).toEqual(deepFlattened);
});

test('Iter_.flatten: depth 2', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(2);
  expect(await asItArray(wrapped)).toEqual([1, 2, '3a', 4, '5a', [6, '7a'], 8, 9]);
});

test('Iter_.flatten: full depth 3', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(3);
  expect(await asItArray(wrapped)).toEqual(deepFlattened);
});
