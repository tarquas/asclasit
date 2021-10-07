const Deque = require('./deque');

test('Deque: empty', () => {
  const dq = new Deque();
  expect(dq.length).toBe(0);
});

test('Deque: queue', () => {
  const dq = new Deque();
  expect(dq.first).toBe(undefined);
  expect(dq.last).toBe(undefined);
  expect(dq.push(1)).toBe(1);
  expect(dq.first).toBe(1);
  expect(dq.last).toBe(1);
  expect(dq.push(2, 3, 4, 5)).toBe(5);
  expect(dq.first).toBe(1);
  expect(dq.last).toBe(5);
  expect(dq.toArray()).toEqual([1, 2, 3, 4, 5]);
  expect(dq.shift()).toBe(1);
  expect(dq.shift()).toBe(2);
  expect(dq.toArray()).toEqual([3, 4, 5]);
  expect(dq.shift()).toBe(3);
  expect(dq.shift()).toBe(4);
  expect(dq.toArray()).toEqual([5]);
  expect(dq.shift()).toBe(5);
  expect(dq.toArray()).toEqual([]);
});

test('Deque: various', () => {
  const dq = new Deque({quant: 2});
  expect(dq.push(1)).toBe(1);
  expect(dq.push(2, 3, 4, 5)).toBe(5);
  expect(dq.unshift(-5)).toBe(6);
  expect(dq.unshift(-1, -2, -3, -4)).toBe(10);
  expect(dq.pop()).toBe(5);
  expect(dq.shift()).toBe(-1);
  expect(dq.pop()).toBe(4);
  expect(dq.shift()).toBe(-2);
  expect(dq.toArray()).toEqual([-3, -4, -5, 1, 2, 3]);
  expect(Array.from(dq)).toEqual([-3, -4, -5, 1, 2, 3]);
  expect(dq.toArray({reverse: true})).toEqual([3, 2, 1, -5, -4, -3]);
  expect(Array.from(dq.reversed())).toEqual([3, 2, 1, -5, -4, -3]);
  expect(dq.pop()).toBe(3);
  expect(dq.pop()).toBe(2);
  expect(dq.pop()).toBe(1);
  expect(dq.pop()).toBe(-5);
  expect(dq.pop()).toBe(-4);
  expect(dq.pushOne(0)).toBe(2);
  expect(dq.shift()).toBe(-3);
  expect(dq.pop()).toBe(0);
  expect(dq.pop()).toBe(undefined);
  expect(dq.shift()).toBe(undefined);
});

test('Deque: append, prepend', () => {
  const dq = new Deque();
  dq.append([1, 2, 3]);
  dq.prepend([4, 5, 6]);
  dq.append([7, 8, 9]);
  dq.prepend([0, 'a']);
  expect(Array.from(dq)).toEqual(['a', 0, 6, 5, 4, 1, 2, 3, 7, 8, 9]);
});

test('Deque: from', () => {
  expect(Array.from(Deque.from([1, 2, 3]))).toEqual([1, 2, 3]);
  expect(Array.from(Deque.from([1, 2, 3], {reverse: true}))).toEqual([3, 2, 1]);
});

test('Deque: locate, get, set, inc: random access', () => {
  const dq = new Deque();
  dq.unshift(1);
  dq.push(2);
  expect(dq.second).toBe(2);
  expect(dq.get(-2)).toBe(1);
  expect(dq.get(-3)).toBe(undefined);
  expect(dq.locate(1)).toEqual({cur: dq._last, index: 0});
  expect(dq.locate(2)).toEqual({cur: undefined, index: 0});
  expect(dq.locate(-3)).toEqual({cur: undefined, index: -1});
  expect(dq.set(1, -1)).toBe(-1);
  expect(dq.set(2, -2)).toBe(undefined);
  expect(dq.inc(1, -1)).toBe(-2);
  expect(dq.inc(2, -3)).toBe(undefined);
});

test('Deque: slice', () => {
  const dq = new Deque();
  dq.unshift(-2, -1);
  dq.push(1, 2);
  expect(dq.slice(1, 2)).toEqual([-1, 1]);
  expect(dq.slice(-2, 2)).toEqual([-1, 1]);
  expect(dq.slice(-5, 2)).toEqual(undefined);
});
