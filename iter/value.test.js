const cr = require('crypto');

const Iter = require('./value');
require('./make');
require('./map');
require('./object');
const $ = require('../func');
require('../func2/promise');

test('Iter_.appendArray: tee to array', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const array = [];
  wrapped.appendArray(array);
  expect(Array.from(wrapped)).toEqual([2, 6, 7, 6]);
  expect(array).toEqual([2, 6, 7, 6]);
});

test('Iter_.toArray: grab to array', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const array = wrapped.toArray();
  expect(array).toEqual([2, 6, 7, 6]);
});

test('Iter_.toArray: append to array', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = [];
  expect(wrapped.toArray(to)).toBe(to);
  expect(to).toEqual([2, 6, 7, 6]);
});

test('Iter_.prependArray: tee to array from start / reversed', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const array = [];
  wrapped.prependArray(array);
  expect(Array.from(wrapped)).toEqual([2, 6, 7, 6]);
  expect(array).toEqual([6, 7, 6, 2]);
});

test('Iter_.toPrependArray: grab to array reversed', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const array = wrapped.toPrependArray();
  expect(array).toEqual([6, 7, 6, 2]);
});

test('Iter_.toPrependArray: prepend to array reversed', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = [];
  expect(wrapped.toPrependArray(to)).toBe(to);
  expect(to).toEqual([6, 7, 6, 2]);
});

test('Iter_.appendSet: tee to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  wrapped.appendSet(to);
  expect(Array.from(wrapped)).toEqual([2, 6, 7, 6]);
  expect(Array.from(to)).toEqual([2, 6, 7]);
});

test('Iter_.unset: unset from Set or Map', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set([1, 2, 6, 10]);
  wrapped.unset(to);
  expect(Array.from(wrapped)).toEqual([2, 6, 7, 6]);
  expect(Array.from(to)).toEqual([1, 10]);
});

test('Iter_.toSet: grab to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const set = wrapped.toSet();
  expect(Array.from(set)).toEqual([2, 6, 7]);
});

test('Iter_.toSet: append to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  expect(wrapped.toSet(to)).toBe(to);
  expect(Array.from(to)).toEqual([2, 6, 7]);
});

test('Iter_.appendXorSet: tee and xor to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const to = new Set();
  wrapped.appendXorSet(to);
  expect(Array.from(wrapped)).toEqual([true, true, true, false]);
  expect(Array.from(to)).toEqual([2, 7]);
});

test('Iter_.appendXorSet: only detect xor operations', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  wrapped.appendXorSet();
  expect(Array.from(wrapped)).toEqual([true, true, true, false]);
});

test('Iter_.toXorSet: xor to set', () => {
  const wrapped = new Iter([2, 6, 7, 6][Symbol.iterator]());
  const set = wrapped.toXorSet();
  expect(Array.from(set)).toEqual([2, 7]);
});

test('Iter_.appendObject: tee object from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = Object.create(null);
  wrapped.appendObject(to, true);
  expect(Object.fromEntries(wrapped)).toEqual({a: 1, b: 2, c: true});
  expect(to).toEqual({a: 1, b: 2, c: true});
});

test('Iter_.omit: omit from object', () => {
  const wrapped = new Iter(['a', 'b', 'c'][Symbol.iterator]());
  const to = {a: 5, d: 8, x: 1, c: 2};
  wrapped.omit(to);
  expect(Array.from(wrapped)).toEqual(['a', 'b', 'c']);
  expect(to).toEqual({d: 8, x: 1});
});

test('Iter_.toObject: get object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  expect(entries.toObject(true)).toEqual({a: 1, b: 2, c: true});
});

test('Iter_.toObject: get object from entries with default', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  expect(entries.toObject(null, false)).toEqual({a: 1, b: 2, c: false});
});

test('Iter_.defaultsObject: tee to defaults object from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', {b: 2}, null][Symbol.iterator]());
  const to = {b: 8, null: 6};
  wrapped.defaultsObject(null, false).defaultsObject(to);
  expect(Object.fromEntries(wrapped)).toEqual({a: 1, b: 2, c: false});
  expect(to).toEqual({a: 1, b: 8, c: false, null: 6});
});

test('Iter_.toDefaultsObject: get to object from entries', () => {
  const entries = new Iter([['a', 1], {b: 0}, 'c', ['b', 2], null][Symbol.iterator]());
  expect(entries.toDefaultsObject(true)).toEqual({a: 1, b: 0, c: true});
});

test('Iter_.toDefaultsObject: get to object from entries: explicit null spec', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  expect(entries.toDefaultsObject(null, true)).toEqual({a: 1, b: 0, c: true});
});

test('Iter_.toDefaultsObject: get to defaults object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = {a: 'hi', c: 4};
  expect(entries.toDefaultsObject(to, true)).toEqual({a: 'hi', b: 0, c: 4});
});

test('Iter_.appendXorObject: tee and xor to object from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = Object.create(null);
  wrapped.appendXorObject(to, true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
  expect(to).toEqual({a: 1, c: true, null: true});
});

test('Iter_.appendXorObject: only detect xor operations', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorObject(true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
});

test('Iter_.appendXorObject: only detect xor operations', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorObject(null, true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
});

test('Iter_.toXorObject: xor to object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], 'c', null][Symbol.iterator]());
  expect(entries.toXorObject(true)).toEqual({a: 1, null: true});
});

test('Iter_.toXorObject: xor to object from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], 'c', null][Symbol.iterator]());
  expect(entries.toXorObject(null, true)).toEqual({a: 1, null: true});
});

test('Iter_.appendMap: tee map from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = new Map();
  wrapped.appendMap(to, true);
  expect(Object.fromEntries(wrapped)).toEqual({a: 1, b: 2, c: true, null: true});
  expect(Object.fromEntries(to)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.toMap: get map from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const map = entries.toMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: 1, b: 2, c: true, null: true});
});

test('Iter_.defaultsMap: tee to defaults map from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = new Map([['c', 'cc'], ['a', 3]]);
  wrapped.defaultsMap(to, true);
  expect(Object.fromEntries(wrapped)).toEqual({a: 1, b: 2, c: true, null: true});
  expect(Object.fromEntries(to)).toEqual({a: 3, b: 0, c: 'cc', null: true});
});

test('Iter_.toDefaultsMap: get to defaults map from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const map = entries.toDefaultsMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: 1, b: 0, c: true, null: true});
});

test('Iter_.appendXorMap: tee and xor to map from entries', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  const to = new Map();
  wrapped.appendXorMap(to, true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
  expect(Object.fromEntries(to)).toEqual({a: 1, c: true, null: true});
});

test('Iter_.appendXorMap: only detect xor operations', () => {
  const wrapped = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], null][Symbol.iterator]());
  wrapped.appendXorMap(true);
  expect(Array.from(wrapped)).toEqual([true, true, true, false, true]);
});

test('Iter_.toXorMap: xor to map from entries', () => {
  const entries = new Iter([['a', 1], ['b', 0], 'c', ['b', 2], 'a', null, 'a'][Symbol.iterator]());
  const map = entries.toXorMap(true);
  expect(map instanceof Map).toBe(true);
  expect(Object.fromEntries(map)).toEqual({a: true, c: true, null: true});
});

test('Iter_.count: count iterator items', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  expect(wrapped.count()).toEqual(3);
});

test('Iter_.exec: execute iterator', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  expect(wrapped.exec()).toEqual(undefined);
});

test('Iter_.first: empty', () => {
  const wrapped = new Iter([][Symbol.iterator]());
  expect(wrapped.first()).toEqual(undefined);
});

test('Iter_.first: get only first item', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  expect(wrapped.first()).toEqual(2);
});

test('Iter_.last: get only last item', () => {
  const wrapped = new Iter([2, 6, 7][Symbol.iterator]());
  expect(wrapped.last()).toEqual(7);
});

test('Iter_.reduce: add nothing', () => {
  const wrapped = new Iter([][Symbol.iterator]());
  const out = Object.create(null);
  expect(wrapped.reduce($.sum, null, out)).toEqual(undefined);
  expect(out).toEqual({});
});

test('Iter_.reduce: multiply numbers', () => {
  const wrapped = new Iter([1, 2, 3, 4, 5][Symbol.iterator]());
  const out = Object.create(null);
  expect(wrapped.reduce($.prod, null, out)).toEqual(120);
  expect(out).toEqual({count: 5, result: 120});
});

test('Iter_.reduce: concat strings', () => {
  const wrapped = new Iter(['a', 'b', 'c', 'hello'][Symbol.iterator]());
  const out = Object.create(null);
  expect(wrapped.reduce(null, null, out)).toEqual('abchello');
  expect(out).toEqual({count: 4, result: 'abchello'});
});

test('Iter_.toIter: duplicate iter', () => {
  const from = new Iter([1, 2, 3][Symbol.iterator]());
  const to = from.toIter();
  expect(to !== from).toBe(true);
  expect(to instanceof Iter).toBe(true);
  expect(Array.from(to)).toEqual([1, 2, 3]);
});

class Quoter extends Iter {
  *$_quote_(iter) {
    for (const item of iter) {
      yield `"${item}"`;
    }
  }

  *$_tick_(iter) {
    for (const item of iter) {
      yield `'${item}'`;
    }
  }

  $_spaced(iter) {
    const m = Iter.from(iter).maps(v => [' ', v]);
    m.ffwd(1);
    return m.reduce();
  }
}

test('Iter_.to: cast to subclass', () => {
  const from = new Iter([1, 2, 3][Symbol.iterator]());
  const to = from.to(Quoter);
  expect(to !== from).toBe(true);
  expect(to instanceof Iter).toBe(true);
  expect(to instanceof Quoter).toBe(true);
  expect(to.$).toBe(Quoter);
  expect(Array.from(to.quote().tick())).toEqual([`'"1"'`, `'"2"'`, `'"3"'`]);
  expect(Quoter.from([1, 2, 3]).spaced()).toBe('1 2 3');
});

test('$.feedback: return', () => {
  const fb = new Iter(function* () { yield 1; yield 2; } ()).feedback();
  expect(fb.next()).toEqual({value: 1, done: false});
  expect(fb.return()).toEqual({done: true});
});

test('$.feedback: throw', () => {
  const fb = new Iter(function* () { yield 1; yield 2; } ()).feedback();
  expect(fb.next()).toEqual({value: 1, done: false});
  expect(() => fb.throw(new Error('break'))).toThrow('break');
});

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('Iter_.stream: pipe to duplex stream', async () => {
  const stream = Iter.range(5).map($.string).stream(cr.createCipheriv('bf-cbc', '1234', '12345678'));
  const crypted = Iter.from(await asItArray(stream)).map(v => v.toString('hex')).reduce();
  expect(stream.constructor.name).toBe('Cipheriv');
  expect(crypted).toBe('68422a8db6cd9371');
});

test('Iter_.streams: partially pipe to duplex stream', async () => {
  const cipher = cr.createCipheriv('bf-cbc', '1234', '12345678');
  const out = Object.create(null);
  const stream = Iter.range(5).map($.string).streams(cipher, out);
  await $.finishedRead(out.stream);
  const stream2 = Iter.range(5).map($.string).stream().pipe(cipher);
  await $.finishedWrite(stream2);
  const crypted = Iter.from(await asItArray(stream2)).map($.string_('hex')).reduce();
  expect(crypted).toBe('7f04e1fa59d4c6b6e13fd4493d9d6c8a');
  expect(stream).toBe(cipher);
  expect(stream2).toBe(cipher);
});
