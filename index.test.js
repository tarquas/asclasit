const $ = require('./index');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('$: empty: null-prototype object', () => {
  const obj = $();
  expect(Object.getPrototypeOf(obj)).toEqual(null);
  expect(obj).toEqual({});
});

test('$: void iterator: null', () => {
  const wrapped = $(null);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([]);
});

test('$: unknown: other', () => {
  expect(() => $(Symbol())).toThrow('unknown');
});

test('$: make array iterator wrapper', () => {
  const wrapped = $([1, 2, 7], 'x', [8, 3, 2]);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([1, 2, 7, 'x', 8, 3, 2]);
});

test('$: make string characters iterator wrapper', () => {
  const wrapped = $(new String('Hello'));
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual('Hello'.split(''));
});

test('$: make range iterator wrapper', () => {
  const wrapped = $(100, 120, 10);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([100, 110]);
});

test('$: make async iterator wrapper', async () => {
  const wrapped = $('01', async function*() {yield 'a'; yield 'b';} (), ['c', 'd']);
  expect(wrapped instanceof $.AsIt).toBe(true);
  expect(await asItArray(wrapped)).toEqual(['01', 'a', 'b', 'c', 'd']);
});

test('$: make object entries iterator with explicit concat', () => {
  const wrapped = $({a: 1, b: 2, c: 3}, {d: 4}).concat({e: 5});
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped.from())).toEqual([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);
});

test('$: make object entries iterator with implicit concat', () => {
  const wrapped = $({a: 1, b: 2, c: 3}, {d: 4}, [['e', 5]]);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped.from())).toEqual([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);
});

test('$.enum: create enum', () => {
  const fruits = $.enum('apple', 'pear', 'orange');
  expect(fruits).toEqual({apple: 1, pear: 2, orange: 3, $: {1: 'apple', 2: 'pear', 3: 'orange'}});
});

test('$.enum: create fixed enum', () => {
  const fruits = $.enum({unknown: 1, apple: 10, pear: 20, orange: 30}, 'n/a');

  expect(fruits).toEqual({
    unknown: 1, 'n/a': 2, apple: 10, pear: 20, orange: 30,
    $: {1: 'unknown', 2: 'n/a', 10: 'apple', 20: 'pear', 30: 'orange'}
  });
});

test('Iter_.toAsIt: convert from iter to asIt', async () => {
  const iter = $([1, 2, 3]);
  const asIt = iter.toAsIt();
  expect(asIt instanceof $.AsIt).toBe(true);
  expect(await asItArray(asIt)).toEqual([1, 2, 3]);
});

test('$.keys: shortcut to Iter.objectsKeys', () => {
  const keys = $.keys({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(keys)).toEqual(['a', 'b', 'c']);
});

test('$.values: shortcut to Iter.objectsValues', () => {
  const values = $.values({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(values)).toEqual([1, 2, 3]);
});

test('$.entries: shortcut to Iter.objectsEntries', () => {
  const entries = $.entries({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(entries)).toEqual([['a', 1], ['b', 2], ['c', 3]]);
});

test('$: async class', () => {
  expect(() => new $()).toThrow('not yet implemented');
});
