const AsIt = require('./realign');
require('./filter');
const $ = require('../func');

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

test('AsIt_.sep: separate items: literal', async () => {
  const iter = new AsIt(AsIt.getIter(['apple', 'orange', 'melon']));
  iter.sep(', ');
  expect(await asItArray(iter)).toEqual(['apple', ', ', 'orange', ', ', 'melon']);
});

test('AsIt_.sep: separate items: gen + condition', async () => {
  const iter = new AsIt(AsIt.getIter(['apple', 'orange', 'melon', ' - good', 'not bad']));
  iter.sep([';', ' '], (p, item) => item[0] !== ' ');
  expect(await asItArray(iter)).toEqual(['apple', ';', ' ', 'orange', ';', ' ', 'melon', ' - good', ';', ' ', 'not bad']);
});

test('AsIt_.sortedWith: mix in from external sorted iterator', async () => {
  const a1 = [1, 4, 9, 10];
  const a2 = [0, 2, 5, 6, 7, 12, 13, 16];
  const a = AsIt.from(a1).sortedWith(a2, $.numSort);
  expect(await asItArray(a)).toEqual([0, 1, 2, 4, 5, 6, 7, 9, 10, 12, 13, 16]);
});

test('AsIt_.sortedWith: mix in from external sorted iterator', async () => {
  const a1 = [8, 5, 2, 1];
  const a2 = [7, 6, 3];
  const a = AsIt.from(a1).sortedWith(a2, $.neg_($.numSort));
  expect(await asItArray(a)).toEqual([8, 7, 6, 5, 3, 2, 1]);
});

test('AsIt_.sortedWith: emergency stop', async () => {
  const a1 = {
    [Symbol.iterator]() { return this },
    next() { return {value: 2}; },
    return() { throw 3; }
  };

  const a2 = {
    [Symbol.asyncIterator]() { return this },
    async next() { if (this.a) throw 1; this.a = 1; return {value: 0}; },
  };

  const a = new AsIt(a1).sortedWith(a2, $.numSort);

  try {
    await asItArray(a);
    expect(true).toBe(false);
  } catch (err) {
    expect(err).toEqual(1);
  }

  a2.a = 0;
  const b = new AsIt(a2).sortedWith(a1, $.numSort);

  try {
    await asItArray(b);
    expect(true).toBe(false);
  } catch (err) {
    expect(err).toEqual(1);
  }
});

test('AsIt_.sort: return sorted array: ascending', async () => {
  const from = AsIt.from([8, 2, 6, 1, 0, -1, 8]);
  expect(await from.sort()).toEqual([-1, 0, 1, 2, 6, 8, 8]);
});

test('AsIt_.sort: return sorted array: descending; skip', async () => {
  const from = AsIt.from([8, 2, 6, 1, 0, -1, 8]);
  expect(await from.sort({desc: true, skip: 2})).toEqual([6, 2, 1, 0, -1]);
});

test('AsIt_.sort: zero limit', async () => {
  const from = AsIt.from([8, 2, 6, 1, 0, -1, 8]);
  expect(await from.sort(0)).toEqual([]);
  expect(await asItArray(from)).toEqual([]);
});

test('AsIt_.sort: paging example', async () => {
  const src = [8, 2, 6, 1, 1, 0, -1, 8];

  const p1 = AsIt.from(src);
  const p1a = await p1.sort(3);
  expect(p1a).toEqual([-1, 0, 1]);

  // not optimal: additional memory for `skip`:
  const p2 = AsIt.from(src);
  const p2a = await p2.sort({skip: 3, limit: 3});
  expect(p2a).toEqual([1, 2, 6]);

  // optimal alternative to above: filter, then use skip=1:
  const p2x = AsIt.from(src);
  const p2xa = await p2x.sort({skip: 1, limit: 3, filter: $.gte_($.lastElem(p1a))});
  expect(p2xa).toEqual([1, 2, 6]);

  // several filters:
  const p2y = AsIt.from(src);
  const p2ya = await p2y.sort({skip: 1, limit: 3, filters: [$.lt_($.lastElem(p1a)), $.not]});
  expect(p2ya).toEqual([1, 2, 6]);
});
