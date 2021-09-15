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
