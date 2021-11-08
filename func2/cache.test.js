const $ = require('./cache');
const Iter = require('../iter');
const AsIt = require('../as-it');


//test=$.echo;

test('$.cacheChunk_: Array -> Object', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject());
  expect(c([1, 2, 3])).toEqual({1: 2, 2: 3, 3: 4});
});

test('$.cacheChunk_: Set -> Object', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject());
  expect(c(new Set([1, 2, 3]))).toEqual({1: 2, 2: 3, 3: 4});
});

test('$.cacheChunk_: Object -> Object', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject());
  expect(c({a: 1, b: 2, c: 3})).toEqual({a: 2, b: 3, c: 4});
});

test('$.cacheChunk_: Map -> Object', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject());
  expect(c(new Map([['a', 1], ['b', 2], ['c', 3]]))).toEqual({a: 2, b: 3, c: 4});
});

test('$.cacheChunk_: Array -> Array', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject(), Array);
  expect(c([1, 2, 3])).toEqual([2, 3, 4]);
});

test('$.cacheChunk_: Set -> Array', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject(), Array);
  expect(c(new Set([1, 2, 3]))).toEqual([2, 3, 4]);
});

test('$.cacheChunk_: Map -> Array: ignore keys', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject(), Array);
  expect(c(new Map([['a', 1], ['b', 2], ['c', 3]]))).toEqual([2, 3, 4]);
});

test('$.cacheChunk_: Array -> Map', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject(), Map);
  expect(c([1, 2, 3])).toEqual(new Map([[1, 2], [2, 3], [3, 4]]));
});

test('$.cacheChunk_: Set -> Map', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject(), Map);
  expect(c(new Set([1, 2, 3]))).toEqual(new Map([[1, 2], [2, 3], [3, 4]]));
});

test('$.cacheChunk_: Object -> Map', () => {
  const c = $.cacheChunk_(2, chunk => Iter.entries(chunk).map($.invert).mapValue(v => v + 1).toObject(), Map);
  expect(c({a: 1, b: 2, c: 3})).toEqual(new Map([['a', 2], ['b', 3], ['c', 4]]));
});


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
  const inc = $.cacheChunk_(2, vs => Iter.from(vs).map(2).mapValue($.inc).toMap(), Array);
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
  const inc = $.cacheChunk_(2, async vs => await AsIt.from(vs).map(2).mapValue($.inc).toMap(), Array);
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
  const incs = inc.toChunkCache(Array);
  expect(incs([2, 1])).toEqual([3, 2]);
});

test('$.cache_: toChunkCache async', async () => {
  const inc = $.cache_(4, async v => v + 1);
  await inc(1); await inc(3); await inc(-1);
  const incs = inc.toChunkCache(Array);
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
