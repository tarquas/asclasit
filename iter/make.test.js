const Iter = require('./make');

test('Iter.void: void iterator', () => {
  const wrapped = Iter.void();
  expect(wrapped instanceof Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([]);
});

test('Iter.concat: concatenate iterators', () => {
  const i1 = ['a1', 'a2'];
  const i2 = function* () { yield 'a4'; yield 'a5'; } ();
  const i3 = new Iter(['a6', 'a7'][Symbol.iterator]());
  const concat = Iter.concat(i1, 3, {a: 1}, i2, i3);
  expect(Array.from(concat)).toEqual(['a1', 'a2', 3, ['a', 1], 'a4', 'a5', 'a6', 'a7']);
});

test('Iter.range: 1 arg (x): [0 ... +1 ... x)', () => {
  const wrapped = Iter.range(5);
  expect(wrapped instanceof Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([0, 1, 2, 3, 4]);
});

test('Iter.range: 2 args asc (x, y): [x ... +1 ... y)', () => {
  const wrapped = Iter.range(2, 7);
  expect(wrapped instanceof Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([2, 3, 4, 5, 6]);
});

test('Iter.range: 2 args desc (x, y): [x ... -1 ... y)', () => {
  const wrapped = Iter.range(14, 10);
  expect(wrapped instanceof Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([14, 13, 12, 11]);
});

test('Iter.range: 3 args asc (x, y, d): [x ... +d ... y)', () => {
  const wrapped = Iter.range(2, 7, 2);
  expect(wrapped instanceof Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([2, 4, 6]);
});

test('Iter.range: 3 args desc (x, y, d): [x ... +d ... y)', () => {
  const wrapped = Iter.range(14, 10, -3);
  expect(wrapped instanceof Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([14, 11]);
});
