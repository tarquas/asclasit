const AsIt = require('./index');
const $ = require('../func');

test('AsIt_.chunk: by total execution time', async () => {
  const wrapped = new AsIt(AsIt.getIter([1, 2, 3, 4, 5]));
  const res = await wrapped.map($.delay_(100)).chunkMsec(399).toArray();
  expect(res).toEqual([[1, 2, 3], [4, 5]]);
});

test('AsIt_.chunk: by total and individual execution time', async () => {
  const wrapped = new AsIt(AsIt.getIter([0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 3, 4, 4, 4]));
  const res = await wrapped.map(v => $.delay_(v * 50)(v)).chunkMsec(349, $.msec_(199)).toArray();
  expect(res).toEqual([[0, 0, 0, 0, 0, 0, 2, 2, 2], [2, 2], [3], [4], [4], [4]]);
});

test('AsIt_.chunk: by total and individual execution time and count', async () => {
  const wrapped = new AsIt(AsIt.getIter([0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 3, 4, 4, 4]));
  const res = await wrapped.map(v => $.delay_(v * 50)(v)).chunkMsec(349, 6, $.msec_(199)).toArray();
  expect(res).toEqual([[0, 0, 0, 0, 0, 0], [2, 2, 2], [2, 2], [3], [4], [4], [4]]);
});
