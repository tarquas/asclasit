const AsIt = require('./filter');

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

test('AsIt_.skip: shortcut for not filter', async () => {
  const wrapped = new AsIt(AsIt.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.skip(o => o && o.x);
  expect(await asItArray(wrapped)).toEqual(['a', '', 1, 0, null, NaN, [5, 1], false, 0n]);
});

test('AsIt_.skip: skip number of items', async () => {
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
