const $ = require('./cache');
const Iter = require('../iter');
const AsIt = require('../iter');

test('$.cache_: no mapper', () => {
  expect(() => $.cache_(-1)).toThrow('mapper is not function');
});

test('$.cache_: default size', () => {
  const cache = $.cache_(0, $.echo);
  expect(cache.cache.size).toBe($.defaultCacheSize);
});

test('$.cache_: sync', () => {
  const inc = $.cache_(3, $.inc);
  expect(inc(1)).toBe(2);
  expect(Array.from(inc.cache.map)).toEqual([[1, 2]]);
  expect(inc(2)).toBe(3);
  expect(Array.from(inc.cache.map)).toEqual([[1, 2], [2, 3]]);
  expect(inc(1)).toBe(2);
  expect(Array.from(inc.cache.map)).toEqual([[2, 3], [1, 2]]);
  expect(inc(3)).toBe(4);
  expect(Array.from(inc.cache.map)).toEqual([[2, 3], [1, 2], [3, 4]]);
  expect(inc(4)).toBe(5);
  expect(Array.from(inc.cache.map)).toEqual([[1, 2], [3, 4], [4, 5]]);
  inc.dropCache();
  expect(inc.cache.map).toBe(null);
});

test('$.cache_: async', async () => {
  const inc = $.cache_(3, async v => v + 1);
  const inced = inc(1);
  expect(inced instanceof Promise).toBe(true);
  expect(await inced).toBe(2);
  expect(Array.from(inc.cache.map)).toEqual([[1, 2]]);
  expect(await inc(2)).toBe(3);
  expect(Array.from(inc.cache.map)).toEqual([[1, 2], [2, 3]]);
  expect(await inc(1)).toBe(2);
  expect(Array.from(inc.cache.map)).toEqual([[2, 3], [1, 2]]);
  expect(await inc(3)).toBe(4);
  expect(Array.from(inc.cache.map)).toEqual([[2, 3], [1, 2], [3, 4]]);
  expect(await inc(4)).toBe(5);
  expect(Array.from(inc.cache.map)).toEqual([[1, 2], [3, 4], [4, 5]]);
  inc.dropCache();
  expect(inc.cache.map).toBe(null);
});

test('$.cacheChunk_: no mapper', () => {
  expect(() => $.cacheChunk_(-1)).toThrow('mapper is not function');
});

test('$.cacheChunk_: default size', () => {
  const cache = $.cacheChunk_(0, $.echo);
  expect(cache.cache.size).toBe($.defaultCacheSize);
});

test('$.cacheChunk_: sync', () => {
  const inc = $.cacheChunk_(2, vs => Iter.from(vs).map(2).mapValue($.inc).toMap());
  expect(inc([1, 2, 3])).toEqual([2, 3, 4]);
  expect(Array.from(inc.cache.map)).toEqual([[2, 3], [3, 4]]);
  expect(inc([4])).toEqual([5]);
  expect(Array.from(inc.cache.map)).toEqual([[3, 4], [4, 5]]);
  expect(inc([3])).toEqual([4]);
  expect(Array.from(inc.cache.map)).toEqual([[4, 5], [3, 4]]);
  inc.dropCache();
  expect(inc.cache.map).toBe(null);
});

test('$.cacheChunk_: async', async () => {
  const inc = $.cacheChunk_(2, async vs => await AsIt.from(vs).map(2).mapValue($.inc).toMap());
  const inced = inc([1, 2, 3]);
  expect(inced instanceof Promise).toBe(true);
  expect(await inced).toEqual([2, 3, 4]);
  expect(Array.from(inc.cache.map)).toEqual([[2, 3], [3, 4]]);
  expect(await inc([4])).toEqual([5]);
  expect(Array.from(inc.cache.map)).toEqual([[3, 4], [4, 5]]);
  expect(await inc([3])).toEqual([4]);
  expect(Array.from(inc.cache.map)).toEqual([[4, 5], [3, 4]]);
  inc.dropCache();
  expect(inc.cache.map).toBe(null);
});

test('$.cache_: toChunkCache sync', () => {
  const inc = $.cache_(4, $.inc);
  inc(1); inc(3); inc(-1);
  const incs = inc.toChunkCache();
  expect(incs([2, 1])).toEqual([3, 2]);
});

test('$.cache_: toChunkCache async', async () => {
  const inc = $.cache_(4, async v => v + 1);
  await inc(1); await inc(3); await inc(-1);
  const incs = inc.toChunkCache();
  expect(await incs([2, 1])).toEqual([3, 2]);
});

test('$.cacheChunk_: toCache sync: object', () => {
  const incs = $.cacheChunk_(4, vs => Iter.from(vs).map(2).mapValue($.inc).toObject());
  incs([1, 3, -1]);
  const inc = incs.toCache();
  expect(inc(2)).toEqual(3);
});

test('$.cacheChunk_: toCache async: object', async () => {
  const incs = $.cacheChunk_(4, async vs => await AsIt.from(vs).map(2).mapValue($.inc).toObject());
  await incs([1, 3, -1]);
  const inc = incs.toCache();
  expect(await inc(2)).toEqual(3);
});

test('$.cacheChunk_: toCache sync: map', () => {
  const incs = $.cacheChunk_(4, vs => Iter.from(vs).map(2).mapValue($.inc).toMap());
  incs([1, 3, -1]);
  const inc = incs.toCache();
  expect(inc(2)).toEqual(3);
});

test('$.cacheChunk_: toCache async: map', async () => {
  const incs = $.cacheChunk_(4, async vs => await AsIt.from(vs).map(2).mapValue($.inc).toMap());
  await incs([1, 3, -1]);
  const inc = incs.toCache();
  expect(await inc(2)).toEqual(3);
});
