const $ = require('./index');

test('$: unknown: null', () => {
  expect(() => $(null)).toThrow('unknown');
});

test('$: unknown: other', () => {
  expect(() => $(Symbol())).toThrow('unknown');
});

test('$: make array iterator wrapper', () => {
  const wrapped = $([1, 2, 7]);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([1, 2, 7]);
});

test('$: make string characters iterator wrapper', () => {
  const wrapped = $('Hello');
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual('Hello'.split(''));
});

test('$: make range iterator wrapper', () => {
  const wrapped = $(100, 120, 10);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([100, 110]);
});

test('$: make async iterator wrapper', () => {
  expect(() => $(async function*() {} ())).toThrow('not yet implemented');
});

test('$: async class', () => {
  expect(() => new $()).toThrow('not yet implemented');
});
