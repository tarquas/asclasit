const Iter = require('./filter');
const $ = require('../func');

test('Iter_.filter: true filter', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.filter();
  expect(Array.from(wrapped)).toEqual(['a', 1, {x: 1}, [5, 1]]);
});

test('Iter_.filter: one functional', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.filter(v => !v);
  expect(Array.from(wrapped)).toEqual(['', 0, null, NaN, false, 0n]);
});

test('Iter_.filter: several functionals', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.filter(o => o && o.x, v => !v);
  expect(Array.from(wrapped)).toEqual(['a', '', 1, 0, null, NaN, [5, 1], false, 0n]);
});

test('Iter_.dfilter: one arg', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter($.times_(5));
  expect(Array.from(wrapped)).toEqual(['a', '', 1]);
});

test('Iter_.dfilter: stop', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter(v => v != null ? true : $.stop);
  expect(Array.from(wrapped)).toEqual(['a', '', 1, 0]);
});

test('Iter_.dfilter: post stop', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter((v, a, d, p) => !p ? true : v != null ? true : $.stop);
  expect(Array.from(wrapped)).toEqual(['a', '', 1, 0, null]);
});

test('Iter_.dfilter: pass', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter(v => v != null ? false : $.pass);
  expect(Array.from(wrapped)).toEqual([null, NaN, {x: 1}, [5, 1], false, 0n]);
});

test('Iter_.dfilter: post pass', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter((v, a, d, p) => !p ? true : v != null ? true : $.pass);
  expect(Array.from(wrapped)).toEqual(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]);
});

test('Iter_.dfilter: post pass multiple', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.dfilter($.echo, (v, a, d, p) => !p ? true : v != null ? true : $.pass);
  expect(Array.from(wrapped)).toEqual(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]);
});

test('Iter_.call, Iter_.debug: call external function', () => {
  const res = [];
  const seq = [];
  const wrapped = new Iter(Iter.getIter([1, 2, 3]));
  wrapped.call(x => x + 1, (x, y) => seq.push(x, y));
  wrapped.debug(x => res.push(x));
  expect(Array.from(wrapped)).toEqual([1, 2, 3]);
  expect(res).toEqual([1, 2, 3]);
  expect(seq).toEqual([2, 1, 3, 2, 4, 3]);
});

test('Iter_.dbglog: debug output to console.log', () => {
  let res;
  const logs = [];
  const origLog = console.log;
  console.log = (...ents) => logs.push(...ents);

  try {
    const wr = new Iter(['test']);
    wr.dbglog('Iter.dbglog');
    res = Array.from(wr);
  } finally {
    console.log = origLog;
  }

  expect(res).toEqual(['test']);
  expect(logs).toEqual(['Iter.dbglog', 'test']);
});

test('Iter_.skip: skip first items', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.skip(o => o && o.x, v => !v);
  expect(Array.from(wrapped)).toEqual([{x: 1}, [5, 1], false, 0n]);
});

test('Iter_.skip: skip first number of items', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.skip(5);
  expect(Array.from(wrapped)).toEqual([NaN, {x: 1}, [5, 1], false, 0n]);
});

test('Iter_.take: empty', () => {
  const wrapped = new Iter(Iter.getIter([1, 2, 3, 4, 5, 4, 3, 2, 1]));
  wrapped.take();
  expect(Array.from(wrapped)).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1]);
});

test('Iter_.take: one arg', () => {
  const wrapped = new Iter(Iter.getIter([1, 2, 3, 4, 5, 4, 3, 2, 1]));
  wrapped.take(v => v < 4);
  expect(Array.from(wrapped)).toEqual([1, 2, 3]);
});

test('Iter_.take: multi arg', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.take(o => o && o.x, v => !v);
  expect(Array.from(wrapped)).toEqual(['a', '', 1, 0, null, NaN]);
});

test('Iter_.stop: one arg', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.stop($.eq_(null));
  expect(Array.from(wrapped)).toEqual(['a', '', 1, 0]);
});

test('Iter_.stop: multi arg', () => {
  const wrapped = new Iter(Iter.getIter(['a', '', 1, 0, null, NaN, {x: 1}, [5, 1], false, 0n]));
  wrapped.stop($.times_(7), $.not);
  expect(Array.from(wrapped)).toEqual(['a', '', 1, 0]);
});
