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

test('Iter.prepend: concatenate iterators reversed', () => {
  const i1 = ['a1', 'a2'];
  const i2 = function* () { yield 'a4'; yield 'a5'; } ();
  const i3 = new Iter(['a6', 'a7'][Symbol.iterator]());
  const concat = Iter.prepend(i1, 3, {a: 1}, i2, i3);
  expect(Array.from(concat)).toEqual(['a6', 'a7', 'a4', 'a5', ['a', 1], 3, 'a1', 'a2']);
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

test('AsIt.fork: 1 fork', () => {
  const src = Iter.from([1, 2, 3]);
  const fork1 = src.fork();
  expect(Array.from(fork1)).toEqual([1, 2, 3]);
  expect(Array.from(src)).toEqual([]);
});

test('AsIt.fork: 2 forks', () => {
  const src = Iter.from([1, 2, 3]);
  const fork1 = src.fork();
  const fork2 = src.fork();
  expect(Array.from(fork1)).toEqual([1, 2, 3]);
  expect(Array.from(fork2)).toEqual([1, 2, 3]);
  expect(Array.from(src)).toEqual([]);
});

test('AsIt.fork: 3 forks with 1 chained', () => {
  const src = Iter.from([1, 2, 3]);
  const fork1 = src.fork();
  const fork2 = src.fork();
  const fork3 = fork2.fork();
  expect(Array.from(fork1)).toEqual([1, 2, 3]);
  expect(Array.from(fork2)).toEqual([1, 2, 3]);
  expect(Array.from(fork3)).toEqual([1, 2, 3]);
  expect(Array.from(src)).toEqual([]);
});

test('AsIt.fork: 2 forks: mixed pipeline', () => {
  const src = Iter.from([1, 2, 3]);
  const fork1 = src.fork();
  const fork2 = src.fork();
  expect(fork1.read()).toBe(1);
  expect(Array.from(fork2)).toEqual([1, 2, 3]);
  expect(Array.from(fork1)).toEqual([2, 3]);
  expect(Array.from(src)).toEqual([]);
});

test('AsIt.fork: 3 forks: one broken', () => {
  const src = Iter.from([1, 2, 3]);
  const fork1 = src.fork();
  const fork2 = src.fork();
  const fork3 = src.fork();
  expect(fork1.read()).toBe(1);
  expect(Array.from(fork2)).toEqual([1, 2, 3]);
  expect(Array.from(fork3)).toEqual([1, 2, 3]);
  fork1.return();
  expect(Array.from(src)).toEqual([]);
});

test('AsIt.fork: 1 fork: break limit ok', () => {
  const src = Iter.from([1, 2, 3]);
  const fork1 = src.fork(2);
  expect(Array.from(fork1)).toEqual([1, 2, 3]);
  expect(Array.from(src)).toEqual([]);
});

test('AsIt.fork: 2 forks', () => {
  const src = Iter.from([1, 2, 3]);
  const fork1 = src.fork(2);
  const fork2 = src.fork(2);
  let error;

  try {
    Array.from(fork1);
  } catch (err) {
    error = err;
  }

  expect(error instanceof Iter.ForkBufferLimitExceededError).toBe(true);
  expect(Array.from(src)).toEqual([3]);
});

test('AsIt.fork: 2 raw forks', () => {
  const src = function* () { yield 1; yield 2; yield 3; } ();
  const fork1 = Iter.fork(src);
  const fork2 = Iter.fork(src);
  expect(Array.from(fork1)).toEqual([1, 2, 3]);
  expect(Array.from(fork2)).toEqual([1, 2, 3]);
  expect(Array.from(src)).toEqual([]);
});
