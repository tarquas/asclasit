const Iter = require('./realign');

const toChunk = [1, 2, 3, 4, 5, 6, 7, 8, 9];

test('Iter_.chunk: infinite count', () => {
  const wrapped = new Iter(Iter.getIter(toChunk));
  wrapped.chunk();
  expect(Array.from(wrapped)).toEqual([toChunk]);
});

test('Iter_.chunk: by 3', () => {
  const wrapped = new Iter(Iter.getIter(toChunk));
  wrapped.chunk(3);
  expect(Array.from(wrapped)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
});

test('Iter_.chunk: by 4', () => {
  const wrapped = new Iter(Iter.getIter(toChunk));
  wrapped.chunk(4);
  expect(Array.from(wrapped)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
});

test('Iter_.chunk: by condition', () => {
  const wrapped = new Iter(Iter.getIter(toChunk));
  wrapped.chunk(item => item & 2);
  expect(Array.from(wrapped)).toEqual([[1], [2], [3, 4, 5], [6], [7, 8, 9]]);
});

test('Iter_.chunk: by condition limited to 2', () => {
  const wrapped = new Iter(Iter.getIter(toChunk));
  wrapped.chunk(2, item => item & 2);
  expect(Array.from(wrapped)).toEqual([[1], [2], [3, 4], [5], [6], [7, 8], [9]]);
});

test('Iter_.chunk: by conditions, limited to 2', () => {
  const wrapped = new Iter(Iter.getIter(toChunk));
  wrapped.chunk(2, item => item & 2, v => !v);
  expect(Array.from(wrapped)).toEqual([[1, 2], [3], [4], [5, 6], [7], [8], [9]]);
});

const deepArray = [
  [[1, 2], ['3a', 4]],
  '5a',
  [[[6, '7a'], 8], 9],
];

const deepFlattened = [1, 2, '3a', 4, '5a', 6, '7a', 8, 9];

test('Iter_.flatten: default depth 1', () => {
  const wrapped = new Iter(Iter.getIter(deepArray));
  wrapped.flatten();
  expect(Array.from(wrapped)).toEqual([[1, 2], ['3a', 4], '5a', [[6, '7a'], 8], 9]);
});

test('Iter_.flatten: as-is depth 0', () => {
  const wrapped = new Iter(Iter.getIter(deepArray));
  wrapped.flatten(0);
  expect(Array.from(wrapped)).toEqual(deepArray);
});

test('Iter_.flatten: infinite depth < 0', () => {
  const wrapped = new Iter(Iter.getIter(deepArray));
  wrapped.flatten(-1);
  expect(Array.from(wrapped)).toEqual(deepFlattened);
});

test('Iter_.flatten: infinite depth Infinity', () => {
  const wrapped = new Iter(Iter.getIter(deepArray));
  wrapped.flatten(Infinity);
  expect(Array.from(wrapped)).toEqual(deepFlattened);
});

test('Iter_.flatten: depth 2', () => {
  const wrapped = new Iter(Iter.getIter(deepArray));
  wrapped.flatten(2);
  expect(Array.from(wrapped)).toEqual([1, 2, '3a', 4, '5a', [6, '7a'], 8, 9]);
});

test('Iter_.flatten: full depth 3', () => {
  const wrapped = new Iter(Iter.getIter(deepArray));
  wrapped.flatten(3);
  expect(Array.from(wrapped)).toEqual(deepFlattened);
});
