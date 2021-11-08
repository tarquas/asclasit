const $ = require('./acc'); 

test('$.accumulate: null', () => {
  expect($.accumulate(null)).toBe(null);
});

test('$.accumulate: not object', () => {
  expect($.accumulate(1)).toBe(1);
});

test('$.accumulate: object', () => {
  const src = Object.setPrototypeOf({a: 1}, null);
  const acc = $.accumulate(src, {b: 2});
  expect(acc).toBe(src);
  expect(acc).toEqual({a: 1, b: 2});
});

test('$.accumulate: Object', () => {
  const src = {a: 1};
  const acc = $.accumulate(src, {b: 2});
  expect(acc).toBe(src);
  expect(acc).toEqual({a: 1, b: 2});
});

test('$.accumulate: Date', () => {
  const src = new Date('2020-02-01');
  const acc = $.accumulate(src, '2020-01-01', 1000);
  expect(acc).toBe(src);
  expect(acc).toEqual(new Date('2020-01-01T00:00:01Z'));
});

test('$.accumulate: now Date', () => {
  const src = new Date('2020-02-01');
  const acc = $.accumulate(src, null, 1000);
  expect(acc).toBe(src);
  expect(acc.constructor).toBe(Date);
});

test('$.accumulate: other ctor', () => {
  const src = new SyntaxError();
  const acc = $.accumulate(src, {b: 2});
  expect(acc).toBe(src);
  expect(Object.entries(acc)).toEqual([['b', 2]]);
});

test('$.accumulate: Object key', () => {
  const src = {a: 1};
  const acc = $.accumulate(src, 'b', 'c', {d: 3}, 'b');
  expect(acc).toBe(src);
  expect(acc).toEqual({a: 1, b: 2, c: 1, d: 3});
});

test('$.accumulate: Array', () => {
  const src = [1, 2, 'aaa'];
  const acc = $.accumulate(src, [3, 4], 'bbb', 5);
  expect(acc).toBe(src);
  expect(acc).toEqual([1, 2, 'aaa', 3, 4, 'bbb', 5]);
});

test('$.accumulate: Set', () => {
  const src = new Set([1, 2]);
  const acc = $.accumulate(src, [3, 4], 'sss', 5);
  expect(acc).toBe(src);
  expect(Array.from(acc)).toEqual([1, 2, 3, 4, 'sss', 5]);
});

test('$.accumulate: Map', () => {
  const src = new Map([[1, 1], [2, 2]]);
  const acc = $.accumulate(src, [3, 4], 5, 'aaa');
  expect(acc).toBe(src);
  expect(Array.from(acc)).toEqual([[1, 1], [2, 2], [3, true], [4, true], [5, true], ['aaa', true]]);
});

test('$.accInit: initializers', () => {
  expect($.accInit.get(null)()).toEqual({});
  expect($.accInit.get(Object)()).toEqual({});
  expect($.accInit.get(Array)()).toEqual([]);
  expect($.accInit.get(Set)() instanceof Set).toEqual(true);
  expect($.accInit.get(Map)() instanceof Map).toEqual(true);
  expect($.accInit.get(WeakSet)() instanceof WeakSet).toEqual(true);
  expect($.accInit.get(WeakMap)() instanceof WeakMap).toEqual(true);
  expect($.accInit.get(Date)() instanceof Date).toEqual(true);
});

test('$.initAcc: initialize accumulator from parameter', () => {
  expect($.initAcc(new Error())).toEqual({});
  expect($.initAcc(null) instanceof Set).toBe(true);
  expect($.initAcc({x: 1})).toEqual({});
  expect($.initAcc([1, 2, 3])).toEqual([]);
  expect($.initAcc(new Set([1, 2])) instanceof Set).toBe(true);
  expect($.initAcc(new Map([[1, 2]])) instanceof Map).toBe(true);
  expect($.initAcc(new WeakSet([{}, {}])) instanceof WeakSet).toBe(true);
  expect($.initAcc(new WeakMap([[{}, {}]])) instanceof WeakMap).toBe(true);
  expect($.initAcc(new Date()) instanceof Date).toBe(true);
});
