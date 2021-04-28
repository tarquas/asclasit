const AsIt = require('./feed');
require('./map');
const $ = require('../func');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('AsIt.feed: create a manual feed iterator', async () => {
  const feed = AsIt.feed([1, 2]);
  await feed.push(3, [4, 5]).apush(6, [7, 8]);
  feed.end();
  expect(await asItArray(feed)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

test('AsIt.feed: beyond', async () => {
  const feed = AsIt.feed([1, 2]);
  feed.push(3, [4, 5])

  const check = (async () => {
    expect(await asItArray(feed)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  }) ();

  await feed.apush(6, [7, 8]);
  await feed.end().push().apush();
  feed.end();
  await check;
});

test('AsIt.feed: taken trigger after end', async () => {
  const feed = AsIt.feed([1, 2]);
  await feed.push(3, [4, 5]).apush(6, [7, 8]);
  const wait = new Promise(resolve => feed.feed.taken = resolve);
  feed.end();
  expect(await asItArray(feed)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  await wait;
});

test('AsIt_.prefetch: grab up to managed number of items in advance', async () => {
  const iter = AsIt.from([1, 2, 3, 4, 5, 6]);
  let prefetched;
  const getPrefetched = (buf) => { prefetched = buf; }
  iter.prefetch(getPrefetched, 2);
  expect(await iter.read()).toBe(1);
  await $.tick();
  expect(prefetched).toEqual([2, 3]);
  expect(await iter.read()).toBe(2);
  expect(prefetched).toEqual([3, 4]);
  expect(await iter.affwd(2)).toEqual({done: false, value: 4});
  for (let i = 0; i < 10; i++) await $.tick();
  expect(prefetched).toEqual([5, 6]);
  expect(await iter.read()).toBe(5);
  expect(prefetched).toEqual([6]);
  expect(await iter.read()).toBe(6);
  expect(prefetched).toEqual([]);
  expect(await iter.read()).toBe(undefined);
});

test('AsIt_.prefetch: throw', async () => {
  const iter = AsIt.from(function* () {yield 1; yield 2; throw new Error('interrupted!'); } ()).prefetch(4);
  let error;

  expect(await iter.read()).toBe(1);
  expect(await iter.read()).toBe(2);

  try {
    await iter.read();
  } catch (err) {
    error = err.message;
  }

  expect(error).toBe('interrupted!');
});

test('AsIt_.prefetch: empty', async () => {
  const iter = AsIt.from([1, 2, 3, 4, 5, 6]).prefetch();
  expect(await asItArray(iter)).toEqual([1, 2, 3, 4, 5, 6]);
});

test('AsIt_.prefetch: break', async () => {
  const iter = AsIt.from([1, 2, 3, 4, 5, 6]);
  let prefetched;
  const getPrefetched = (buf) => { prefetched = buf; }
  iter.prefetch(getPrefetched, 2);
  expect(await iter.read()).toBe(1);
  await $.tick();
  expect(prefetched).toEqual([2, 3]);
  expect(await iter.read()).toBe(2);
  await iter.return();
  expect(await iter.read()).toBe(undefined);
});

test('AsIt_.prefetch: by condition', async () => {
  const iter = AsIt.from([1, 2, 3, 4, 5]);
  let prefetched;
  const getPrefetched = (buf) => { prefetched = buf; return buf.length >= 3; }
  iter.prefetch(getPrefetched);
  expect(await iter.read()).toBe(1);
  await $.tick();
  expect(prefetched).toEqual([2, 3, 4]);
  expect(await iter.read()).toBe(2);
  expect(await asItArray(iter)).toEqual([3, 4, 5]);
});

test('AsIt_.prefetch: time PoC', async () => {
  const snap1 = $.upMsec();
  const iter1 = AsIt.from([1, 2, 3, 4, 5, 6]).map($.delayMsec_(100)).prefetch(1).map($.delayMsec_(100));
  expect(await asItArray(iter1)).toEqual([1, 2, 3, 4, 5, 6]);
  expect($.upMsec(snap1).toPrecision(1)).toBe('1e+3');

  const snap2 = $.upMsec();
  const iter2 = AsIt.from([1, 2, 3, 4, 5, 6]).map($.delayMsec_(100)).prefetch(2).map($.delayMsec_(100));
  expect(await asItArray(iter2)).toEqual([1, 2, 3, 4, 5, 6]);
  expect($.upMsec(snap2).toPrecision(1)).toBe('7e+2');
});
