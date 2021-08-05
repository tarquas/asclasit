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
  wrapped.chunk(2, item => item & 2, (item, desc, v) => !v);
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

test('Iter_.cut: as is', () => {
  const cut = new Iter(Iter.getIter([1, 2, 3, 4, 5])).cut(0);
  expect(Array.from(cut)).toEqual([1, 2, 3, 4, 5]);
});

test('Iter_.cut: left', () => {
  const cut = new Iter(Iter.getIter([1, 2, 3, 4, 5])).cut(-2);
  expect(Array.from(cut)).toEqual([1, 2, 3]);
});

test('Iter_.cut: right', () => {
  const cut = new Iter(Iter.getIter([1, 2, 3, 4, 5])).cut(2);
  expect(Array.from(cut)).toEqual([3, 4, 5]);
});

test('Iter_.zipt: termination zip with no iterators yields empty', () => {
  const zipped = Iter.zipt();
  expect(Array.from(zipped)).toEqual([]);
});

test('Iter_.zipt: zip iterators', () => {
  const zipped = Iter.zipt(Iter.getIter([1, 2, 3]), Iter.getIter([4, 5]), Iter.getIter([6]));
  expect(Array.from(zipped)).toEqual([1, 4, 6, 2, 5, , 3, , , , , undefined]);
});

test('Iter_.zipt: term-zip values and iterables with limit to longest', () => {
  const zipped = Iter.zipt([1, 2], [3, 4, 5, 6], 'a', () => ['x', 'y'], function*() {yield 'z'; yield 't'; yield 0;});

  expect(Array.from(zipped)).toEqual([
    1, 3, 'a', 'x', 'z', 2, 4, 'a', 'y', 't', 1, 5, 'a', 'x', 0, 2, 6, 'a', 'y', 'z', 1, 3, 'a', 'x', 't'
  ]);
});

test('Iter_.zip: zip no iterators yields empty', () => {
  const zipped = Iter.zip();
  expect(Array.from(zipped)).toEqual([]);
});

test('Iter_.zip: zip only values yields empty', () => {
  const zipped = Iter.zip(1, 2, 3);
  expect(Array.from(zipped)).toEqual([]);
});

test('Iter_.zip: zip iterators', () => {
  const zipped = Iter.zip(Iter.getIter([1, 2, 3]), Iter.getIter([4, 5]), Iter.getIter([6]));
  expect(Array.from(zipped)).toEqual([1, 4, 6, 2, 5, , 3, , undefined]);
});

test('Iter_.zip: zip values and iterables with limit to longest', () => {
  const zipped = Iter.zip([1, 2], [3, 4, 5, 6], 'a', () => ['x', 'y'], function*() {yield 'z'; yield 't'; yield 0;});
  expect(Array.from(zipped)).toEqual([1, 3, 'a', 'x', 'z', 2, 4, 'a', 'y', 't', 1, 5, 'a', 'x', 0, 2, 6, 'a', 'y', 'z']);
});

test('Iter_.zip: throw', () => {
  const zipped = Iter.zip(
    [1, 2, 3],
    function*() { yield 4; throw new Error('interrupted'); },
    function*() { try { yield 5; yield 6; } catch(err) { throw new Error('unexpected'); } },
  );

  expect(() => Array.from(zipped)).toThrow('interrupted');
});

test('Iter_.dim: unwrap to dimensions', async () => {
  const iter = new Iter([1, 2][Symbol.iterator]());
  iter.dim(['a', 'b'], ([dim1, dim2]) => new Array(dim1).fill(dim2), function* () { yield 'ok'; }, 'good');

  expect(Array.from(iter)).toEqual([
    [1, 'a', 'a', 'ok', 'good'],
    [1, 'b', 'b', 'ok', 'good'],
    [2, 'a', 'a', 'ok', 'good'],
    [2, 'a', 'a', 'ok', 'good'],
    [2, 'b', 'b', 'ok', 'good'],
    [2, 'b', 'b', 'ok', 'good'],
  ]);
});

test('Iter_.sep: separate items: literal', () => {
  const iter = new Iter(Iter.getIter(['apple', 'orange', 'melon']));
  iter.sep(', ');
  expect(Array.from(iter)).toEqual(['apple', ', ', 'orange', ', ', 'melon']);
});

test('Iter_.sep: separate items: gen + condition', () => {
  const iter = new Iter(Iter.getIter(['apple', 'orange', 'melon', ' - good', 'not bad']));
  iter.sep([';', ' '], (p, item) => item[0] !== ' ');
  expect(Array.from(iter)).toEqual(['apple', ';', ' ', 'orange', ';', ' ', 'melon', ' - good', ';', ' ', 'not bad']);
});
