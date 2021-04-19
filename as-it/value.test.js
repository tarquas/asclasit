const AsIt = require('./value');
const Iter = require('../iter');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('AsIt_.appendArray: tee to array', async () => {
  const wrapped = new AsIt([2, 6, 7, 6][Symbol.iterator]());
  const array = [];
  wrapped.appendArray(array);
  expect(await asItArray(wrapped)).toEqual([2, 6, 7, 6]);
  expect(array).toEqual([2, 6, 7, 6]);
});

test('AsIt_.toArray: grab to array', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  const array = await wrapped.toArray();
  expect(array).toEqual([2, 6, 7]);
});

test('AsIt_.toArray: append to array', async () => {
  const wrapped = new AsIt([2, 6, 7, 6][Symbol.iterator]());
  const to = [];
  expect(await wrapped.toArray(to)).toBe(to);
  expect(to).toEqual([2, 6, 7, 6]);
});

test('AsIt_.appendSet: tee to set', async () => {
  const wrapped = new AsIt([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  wrapped.appendSet(to);
  expect(await asItArray(wrapped)).toEqual([2, 6, 7, 6]);
  expect(Array.from(to)).toEqual([2, 6, 7]);
});

test('AsIt_.toSet: grab to set', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  const set = await wrapped.toSet();
  expect(Array.from(set)).toEqual([2, 6, 7]);
});

test('AsIt_.toSet: append to set', async () => {
  const wrapped = new AsIt([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  expect(await wrapped.toSet(to)).toBe(to);
  expect(Array.from(to)).toEqual([2, 6, 7]);
});

test('AsIt_.appendXorSet: tee and xor to set', async () => {
  const wrapped = new AsIt([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  wrapped.appendXorSet(to);
  expect(await asItArray(wrapped)).toEqual([true, true, true, false]);
  expect(Array.from(to)).toEqual([2, 7]);
});

test('AsIt_.appendXorSet: only detect xor operations', async () => {
  const wrapped = new AsIt([2, 6, 7, 6][Symbol.iterator]());
  wrapped.appendXorSet();
  expect(await asItArray(wrapped)).toEqual([true, true, true, false]);
});

test('AsIt_.toXorSet: xor to set', async () => {
  const wrapped = new AsIt([2, 6, 7, 6][Symbol.iterator]());
  const set = await wrapped.toXorSet();
  expect(Array.from(set)).toEqual([2, 7]);
});

test('AsIt_.appendObject: tee object from entries', async () => {
  const wrapped = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = Object.create(null);
  wrapped.appendObject(to, true);
  expect(Object.fromEntries(await asItArray(wrapped))).toEqual({a: 1, b: 2, c: true, null: true});
  expect(to).toEqual({a: 1, b: 2, c: true, null: true});
});

test('AsIt_.toObject: get object from entries', async () => {
  const entries = new AsIt([['a', 1], ['b', 2], 'c', null][Symbol.iterator]());
  const object = await entries.toObject(true);
  expect(object).toEqual({a: 1, b: 2, c: true, null: true});
});

test('AsIt_.toObject: get object from entries', async () => {
  const entries = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  expect(await entries.toObject(null, true)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('AsIt_.appendXorObject: tee and xor to object from entries', async () => {
  const wrapped = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = Object.create(null);
  wrapped.appendXorObject(to, true);
  expect(await asItArray(wrapped)).toEqual([true, true, true, false, true]);
  expect(to).toEqual({a: 1, c: true, null: true});
});

test('AsIt_.appendXorObject: only detect xor operations', async () => {
  const wrapped = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorObject(true);
  expect(await asItArray(wrapped)).toEqual([true, true, true, false, true]);
});

test('AsIt_.appendXorObject: only detect xor operations', async () => {
  const wrapped = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorObject(null, true);
  expect(await asItArray(wrapped)).toEqual([true, true, true, false, true]);
});

test('AsIt_.toXorObject: xor to object from entries', async () => {
  const entries = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], 'c', null][Symbol.iterator]());
  expect(await entries.toXorObject(true)).toEqual({a: 1, null: true});
});

test('AsIt_.toXorObject: xor to object from entries', async () => {
  const entries = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], 'c', null][Symbol.iterator]());
  expect(await entries.toXorObject(null, true)).toEqual({a: 1, null: true});
});

test('AsIt_.appendMap: tee map from entries', async () => {
  const wrapped = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = new Map();
  wrapped.appendMap(to, true);
  expect(Object.fromEntries(await asItArray(wrapped))).toEqual({a: 1, b: 2, c: true, null: true});
  expect(Object.fromEntries(to)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('AsIt_.toMap: get map from entries', async () => {
  const entries = new AsIt([['a', 1], ['b', 2], 'c', null][Symbol.iterator]());
  const map = await entries.toMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('AsIt_.appendXorMap: tee and xor to map from entries', async () => {
  const wrapped = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = new Map();
  wrapped.appendXorMap(to, true);
  expect(await asItArray(wrapped)).toEqual([true, true, true, false, true]);
  expect(Object.fromEntries(to)).toEqual({a: 1, c: true, null: true});
});

test('AsIt_.appendXorMap: only detect xor operations', async () => {
  const wrapped = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorMap(true);
  expect(await asItArray(wrapped)).toEqual([true, true, true, false, true]);
});

test('AsIt_.toXorMap: xor to map from entries', async () => {
  const entries = new AsIt([['a', 1], ['b', 0], 'c', ['b', 2], 'a', null, 'a'][Symbol.iterator]());
  const map = await entries.toXorMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: true, c: true, null: true});
});

test('AsIt_.count: count iterator items', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  expect(await wrapped.count()).toEqual(3);
});

test('AsIt_.exec: execute iterator', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  expect(await wrapped.exec()).toEqual(undefined);
});

test('AsIt_.first: empty', async () => {
  const wrapped = new AsIt([][Symbol.iterator]());
  expect(await wrapped.first()).toEqual(undefined);
});

test('AsIt_.first: get only first item', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  expect(await wrapped.first()).toEqual(2);
});

test('AsIt_.last: get only last item', async () => {
  const wrapped = new AsIt([2, 6, 7][Symbol.iterator]());
  expect(await wrapped.last()).toEqual(7);
});

test('AsIt_.toAsIt: duplicate asIt', async () => {
  const from = new AsIt(async function* () { yield 1; yield 2; yield 3; } ());
  const to = from.toAsIt();
  expect(to !== from).toBe(true);
  expect(to instanceof AsIt).toBe(true);
  expect(await asItArray(to)).toEqual([1, 2, 3]);
});

test('AsIt_.toIter: convert from asIt to iter', async () => {
  const asIt = new AsIt(async function* () { yield 1; yield 2; yield 3; } ());
  const iter = await asIt.toIter();
  expect(iter instanceof Iter).toBe(true);
  expect(Array.from(iter)).toEqual([1, 2, 3]);
});
