const $ = require('./reduce');

const arr = [8, 2, 3, 4.4, 9, 1, 7, -3];
const unsafeArr = [null, null, 1, 8, null, 3, -5, undefined, 3.3];

test('$.sum: add numbers', () => {
  const reduced = arr.reduce($.sum);
  expect(reduced).toBe(31.4);
});

test('$.safeSum: zeroes if not numbers', () => {
  const reduced = unsafeArr.reduce($.safeSum);
  expect(reduced).toBe(10.3);
});

test('$.prod: add numbers', () => {
  const reduced = arr.reduce($.prod);
  expect(reduced).toBe(-39916.8);
});

test('$.safeProd: units if zeroes or not numbers', () => {
  const reduced = unsafeArr.reduce($.safeProd);
  expect(reduced).toBe(-396);
});

test('$.max: maximum', () => {
  const reduced = arr.reduce($.max);
  expect(reduced).toBe(9);
});

test('$.safeMax: ignore if not numbers', () => {
  const reduced = unsafeArr.reduce($.safeMax);
  expect(reduced).toBe(8);
});

test('$.min: minimum', () => {
  const reduced = arr.reduce($.min);
  expect(reduced).toBe(-3);
});

test('$.safeMin: ignore if not numbers', () => {
  const reduced = unsafeArr.reduce($.safeMin);
  expect(reduced).toBe(-5);
});

test('$.bitOr: bitwise or', () => {
  const reduced = [1, 2, 3, 16, 17].reduce($.bitOr);
  expect(reduced).toBe(19);
});

test('$.bitAnd: bitwise and', () => {
  const reduced = [18, 34, 10, 19, 66].reduce($.bitAnd);
  expect(reduced).toBe(2);
});

test('$.bitClr: bit clear', () => {
  const reduced = [16, 64, 2].reduce($.bitClr, 253);
  expect(reduced).toBe(173);
});

test('$.bitXor: bitwise xor', () => {
  const reduced = [20, 3, 17].reduce($.bitXor);
  expect(reduced).toBe(6);
});

test('$.or: logical or, false', () => {
  const reduced = [null, false, 0].reduce($.or);
  expect(reduced).toBe(0);
});

test('$.or: logical or, true', () => {
  const reduced = [null, true, [], false, 0].reduce($.or);
  expect(reduced).toBe(true);
});

test('$.orr: logical reverse or, false', () => {
  const reduced = [null, false, 0].reduce($.orr);
  expect(reduced).toBe(null);
});

test('$.orr: logical reverse or, true', () => {
  const reduced = [null, true, [], false, 0].reduce($.orr);
  expect(reduced).toEqual([]);
});

test('$.and: logical and, false', () => {
  const reduced = [{a: 1}, [false], NaN, 6].reduce($.and);
  expect(reduced).toBe(NaN);
});

test('$.and: logical and, true', () => {
  const reduced = [{a: 1}, [false], 6].reduce($.and);
  expect(reduced).toBe(6);
});

test('$.andr: logical reverse and, false', () => {
  const reduced = [{a: 1}, [false], NaN, 6].reduce($.andr);
  expect(reduced).toBe(NaN);
});

test('$.andr: logical reverse and, true', () => {
  const reduced = [{a: 1}, [false], 6].reduce($.andr);
  expect(reduced).toEqual({a: 1});
});

test('$.andNot: logical and-not, false', () => {
  const reduced = [null, {a: 1}, , NaN, 0].reduce($.andNot, {init: true});
  expect(reduced).toBe(null);
});

test('$.andNot: logical and-not, true', () => {
  const reduced = [null, 0, 0n, NaN, false].reduce($.andNot, {init: true});
  expect(reduced).toEqual({init: true});
});

test('$.xor: logical xor, false', () => {
  const reduced = [null, {a: 2}, 0, NaN, 3, 4].reduce($.xor, {a: 1});
  expect(reduced).toBe(null);
});

test('$.xor: logical xor, true', () => {
  const reduced = [null, {a: 2}, 0, {a: 3}, NaN, 3, 4, false].reduce($.xor, {a: 1});
  expect(reduced).toBe(4);
});
