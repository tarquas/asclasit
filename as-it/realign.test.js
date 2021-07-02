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
  wrapped.chunk(2, item => item & 2, async (item, desc, v) => !v);
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

test('AsIt_.flatten: as-is depth 0', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(0);
  expect(await asItArray(wrapped)).toEqual(deepArray);
});

test('AsIt_.flatten: infinite depth < 0', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(-1);
  expect(await asItArray(wrapped)).toEqual(deepFlattened);
});

test('AsIt_.flatten: infinite depth Infinity', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(Infinity);
  expect(await asItArray(wrapped)).toEqual(deepFlattened);
});

test('AsIt_.flatten: depth 2', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(2);
  expect(await asItArray(wrapped)).toEqual([1, 2, '3a', 4, '5a', [6, '7a'], 8, 9]);
});

test('AsIt_.flatten: full depth 3', async () => {
  const wrapped = new AsIt(AsIt.getIter(deepArray));
  wrapped.flatten(3);
  expect(await asItArray(wrapped)).toEqual(deepFlattened);
});

test('AsIt_.cut: as is', async () => {
  const cut = new AsIt(AsIt.getIter([1, 2, 3, 4, 5])).cut(0);
  expect(await asItArray(cut)).toEqual([1, 2, 3, 4, 5]);
});

test('AsIt_.cut: left', async () => {
  const cut = new AsIt(AsIt.getIter([1, 2, 3, 4, 5])).cut(-2);
  expect(await asItArray(cut)).toEqual([1, 2, 3]);
});

test('AsIt_.cut: right', async () => {
  const cut = new AsIt(AsIt.getIter([1, 2, 3, 4, 5])).cut(2);
  expect(await asItArray(cut)).toEqual([3, 4, 5]);
});

test('AsIt_.zipt: termination zip with no iterators yields empty', async () => {
  const zipped = AsIt.zipt();
  expect(await asItArray(zipped)).toEqual([]);
});

test('AsIt_.zipt: zip iterators', async () => {
  const zipped = AsIt.zipt(AsIt.getIter([1, 2, 3]), AsIt.getIter([4, 5]), AsIt.getIter([6]));
  expect(await asItArray(zipped)).toEqual([1, 4, 6, 2, 5, , 3, , , , , undefined]);
});

test('AsIt_.zipt: term-zip values and iterables with limit to longest', async () => {
  const zipped = AsIt.zipt([1, 2], [3, 4, 5, 6], 'a',
    () => ['x', 'y'],
    async function* () { yield 'z'; yield 't'; yield 0;}
  );

  expect(await asItArray(zipped)).toEqual([
    1, 3, 'a', 'x', 'z', 2, 4, 'a', 'y', 't', 1, 5, 'a', 'x', 0, 2, 6, 'a', 'y', 'z', 1, 3, 'a', 'x', 't'
  ]);
});

test('AsIt_.zip: zip no iterators yields empty', async () => {
  const zipped = AsIt.zip();
  expect(await asItArray(zipped)).toEqual([]);
});

test('AsIt_.zip: zip only values yields empty', async () => {
  const zipped = AsIt.zip(1, 2, 3);
  expect(await asItArray(zipped)).toEqual([]);
});

test('AsIt_.zip: zip iterators', async () => {
  const zipped = AsIt.zip(AsIt.getIter([1, 2, 3]), AsIt.getIter([4, 5]), AsIt.getIter([6]));
  expect(await asItArray(zipped)).toEqual([1, 4, 6, 2, 5, , 3, , undefined]);
});

test('AsIt_.zip: zip values and iterables with limit to longest', async () => {
  const zipped = AsIt.zip([1, 2], [3, 4, 5, 6], 'a',
    () => ['x', 'y'],
    function* () { yield 'z'; yield 't'; yield 0; }
  );

  expect(await asItArray(zipped)).toEqual([1, 3, 'a', 'x', 'z', 2, 4, 'a', 'y', 't', 1, 5, 'a', 'x', 0, 2, 6, 'a', 'y', 'z']);
});

test('AsIt_.zip: throw', async () => {
  const zipped = AsIt.zip(
    [1, 2, 3],
    async function*() { yield 4; throw new Error('interrupted'); },
    async function*() { try { yield 5; yield 6; } catch(err) { throw new Error('unexpected'); } },
  );

  try {
    await asItArray(zipped);
  } catch (err) {
    expect(err.message).toEqual('interrupted');
  }
});

test('AsIt_.dim: unwrap to dimensions', async () => {
  const iter = new AsIt([1, 2][Symbol.iterator]());

  iter.dim(['a', 'b'],
    async function* ([dim1, dim2]) { yield* new Array(dim1).fill(dim2); },
    async function* () { yield 'ok'; }, 'good'
  );

  expect(await asItArray(iter)).toEqual([
    [1, 'a', 'a', 'ok', 'good'],
    [1, 'b', 'b', 'ok', 'good'],
    [2, 'a', 'a', 'ok', 'good'],
    [2, 'a', 'a', 'ok', 'good'],
    [2, 'b', 'b', 'ok', 'good'],
    [2, 'b', 'b', 'ok', 'good'],
  ]);
});
