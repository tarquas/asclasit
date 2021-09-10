const PQ = require('./priority-queue');

test('$.PQ: priority queue', () => {
  const pq = new PQ({reverse: true});
  expect(pq.pop()).toBe(undefined);
  expect(pq.push(1, 7, 4, 9)).toBe(4);
  expect(pq.push(2)).toBe(5);
  expect(pq.pop()).toBe(9);
  expect(pq.pop()).toBe(7);
  expect(pq.pop()).toBe(4);
  expect(Array.from(pq)).toEqual([2, 1]);
  expect(pq.toArray()).toEqual([]);
});

test('$.PQ.Limited: priority queue', () => {
  const pq = new PQ.Limited();
  expect(pq.pop()).toBe(undefined);
  expect(pq.push(1, 7, 4, 9)).toBe(4);
  expect(pq.push(2)).toBe(5);
  expect(pq.pop()).toBe(1);
  expect(pq.pop()).toBe(2);
  expect(pq.pop()).toBe(4);
  expect(Array.from(pq)).toEqual([7, 9]);
  expect(pq.toArray()).toEqual([]);
});

test('$.PQ.Limited: limited priority queue: ascending', () => {
  const pq = new PQ.Limited({reverse: true, limit: 4});
  expect(pq.size).toBe(0);
  expect(pq.isEmpty).toBe(true);
  expect(pq.push(5, 2, 8, 0, 10, 6)).toBe(4);
  expect(pq.size).toBe(4);
  expect(pq.isEmpty).toBe(false);
  expect(pq.top).toBe(6);
  expect(pq.peek()).toBe(6);
  expect(pq.toArray({raw: true})).toEqual([6, 2, 5, 0]);
  expect(pq.toArray({reverse: true, keep: true})).toEqual([6, 5, 2, 0]);
  expect(pq.toArray({sort: (a, b) => a & 1 ? (b & 1 ? a - b : 1) : (b & 1 ? -1 : a - b), keep: true})).toEqual([0, 2, 6, 5]);
  expect(pq.toArray()).toEqual([0, 2, 5, 6]);
});

test('$.PQ.Limited: limited priority queue: descending', () => {
  const pq = new PQ.Limited({limit: 4});
  expect(pq.length).toBe(0);
  expect(pq.isEmpty).toBe(true);
  expect(pq.push(5, 2, 8, 0, 10, 6)).toBe(4);
  expect(pq.length).toBe(4);
  expect(pq.isEmpty).toBe(false);
  expect(pq.top).toBe(5);
  expect(pq.peek()).toBe(5);
  expect(pq.toArray({raw: true})).toEqual([5, 6, 8, 10]);
  expect(pq.toArray({reverse: true, keep: true})).toEqual([5, 6, 8, 10]);
  expect(pq.toArray({sort: (a, b) => a & 1 ? (b & 1 ? a - b : 1) : (b & 1 ? -1 : a - b), keep: true})).toEqual([6, 8, 10, 5]);
  expect(pq.toArray()).toEqual([10, 8, 6, 5]);
});
