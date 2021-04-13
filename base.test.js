const $ = require('./base');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('$: unknown: null', () => {
  expect(() => $(null)).toThrow('unknown');
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

test('Iter_.iter: duplicate iter', () => {
  const from = $([1, 2, 3]);
  const to = from.iter();
  expect(to !== from).toBe(true);
  expect(to instanceof $.Iter).toBe(true);
  expect(Array.from(to)).toEqual([1, 2, 3]);
});

test('Iter_.asIt: convert from iter to asIt', async () => {
  const iter = $([1, 2, 3]);
  const asIt = iter.asIt();
  expect(asIt instanceof $.AsIt).toBe(true);
  expect(await asItArray(asIt)).toEqual([1, 2, 3]);
});

test('AsIt_.asIt: duplicate asIt', async () => {
  const from = $(async function* () { yield 1; yield 2; yield 3; } ());
  const to = from.asIt();
  expect(to !== from).toBe(true);
  expect(to instanceof $.AsIt).toBe(true);
  expect(await asItArray(to)).toEqual([1, 2, 3]);
});

test('AsIt_.iter: convert from asIt to iter', async () => {
  const asIt = $(async function* () { yield 1; yield 2; yield 3; } ());
  const iter = await asIt.iter();
  expect(iter instanceof $.Iter).toBe(true);
  expect(Array.from(iter)).toEqual([1, 2, 3]);
});

test('$: async class', () => {
  expect(() => new $()).toThrow('not yet implemented');
});
