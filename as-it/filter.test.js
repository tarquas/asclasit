const AsIt = require('./filter');
const $ = require('../func');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('AsIt_.filter: true filter', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.filter();
  expect(await asItArray(wrapped)).toEqual(['a', 1, {x: 1}, [5, 1]]);
});

test('AsIt_.filter: one functional', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.filter(async v => !v);
  expect(await asItArray(wrapped)).toEqual(['', 0, null, NaN, false, 0n]);
});

test('AsIt_.filter: several functionals', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.filter(async o => o && o.x, v => !v);
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0, null, NaN, [5, 1], false, 0n]);
});

test('AsIt_.dfilter: one arg', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter($.times_(5));
  expect(await asItArray(wrapped)).toEqual(['a', '', 1]);
});

test('AsIt_.dfilter: stop', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter(v => v != null ? true : $.stop);
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0]);
});

test('AsIt_.dfilter: post stop', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter((v, a, d, p) => !p ? true : v != null ? true : $.stop);
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0, null]);
});

test('AsIt_.dfilter: pass', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter(v => v != null ? false : $.pass);
  expect(await asItArray(wrapped)).toEqual([null, NaN, {x: 1}, [5, 1], false, 0n]);
});

test('AsIt_.dfilter: post pass', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter((v, a, d, p) => !p ? true : v != null ? true : $.pass);
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]);
});

test('AsIt_.dfilter: post pass multiple', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter($.echo, (v, a, d, p) => !p ? true : v != null ? true : $.pass);
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]);
});

test('AsIt_.call, AsIt_.debug: call external function', async () => {
  const res = [];
  const seq = [];
  const wrapped = new AsIt(AsIt.getIter([1, 2, 3]));
  wrapped.call(async x => x + 1, (x, y) => seq.push(x, y));
  wrapped.debug(async x => res.push(x));
  expect(await asItArray(wrapped)).toEqual([1, 2, 3]);
  expect(res).toEqual([1, 2, 3]);
  expect(seq).toEqual([2, 1, 3, 2, 4, 3]);
});

test('AsIt_.dbglog: debug output to console.log', async () => {
  const wr = new AsIt(['test']);
  wr.dbglog('AsIt.dbglog');
  expect(await asItArray(wr)).toEqual(['test']);
});

test('AsIt_.skip: skip first items', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.skip(o => o && o.x, v => !v);
  expect(await asItArray(wrapped)).toEqual([{x: 1}, [5, 1], false, 0n]);
});

test('AsIt_.skip: skip first number of items', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.skip(5);
  expect(await asItArray(wrapped)).toEqual([NaN, {x: 1}, [5, 1], false, 0n]);
});

test('AsIt_.take: empty', async () => {
  const wrapped = new AsIt(AsIt.getIter([1, 2, 3, 4, 5, 4, 3, 2, 1]));
  wrapped.take();
  expect(await asItArray(wrapped)).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1]);
});

test('AsIt_.take: one arg', async () => {
  const wrapped = new AsIt(AsIt.getIter([1, 2, 3, 4, 5, 4, 3, 2, 1]));
  wrapped.take(v => v < 4);
  expect(await asItArray(wrapped)).toEqual([1, 2, 3]);
});

test('AsIt_.take: multi arg', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.take(o => o && o.x, v => !v);
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0, null, NaN]);
});

test('AsIt_.stop: one arg', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.stop($.eq_(null));
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0]);
});

test('AsIt_.stop: multi arg', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.stop($.times_(7), $.not);
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0]);
});
