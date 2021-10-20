const $ = require('./graph');
const Iter = require('../iter');

test('Graph: triangle', () => {
  // (1)---2-->(2)
  //   \       /
  //    2     1
  //     \   /
  //      V V
  //      (3)

  const gr = new $.Graph({cacheDests: 1});
  gr.link(1, 2, 2);
  gr.link(1, 2, 2); // idempotent duplicate
  gr.link(2, 3);
  gr.link(1, 3, 2);

  expect(Iter.from(gr.dests(3)).toObject()).toEqual({
    1: {dist: 2, via: 3, count: 1},
    2: {dist: 1, via: 3, count: 1},
  });

  expect(Array.from(gr.pathOn(1, 3))).toEqual([1, 3]);
  expect(Array.from(gr.pathOn(2, 3))).toEqual([2, 3]);
  expect(Array.from(gr.pathOn(1, 2))).toEqual([1, 2]);

  expect(Array.from(gr.pathStat(1, 2))).toEqual([
    {at: 1, next: 2, length: 2, dist: 0, count: 0, toDist: 2, toCount: 1},
    {at: 2, dist: 2, count: 1},
  ]);

  gr.link(1, 3, 4);

  expect(Array.from(gr.pathOn(1, 3))).toEqual([1, 2, 3]);
  expect(gr.shortestDist(1, 3)).toBe(3);
  expect(gr.shortestSteps(1, 3)).toBe(2);
  expect(Array.from(gr.pathOn(0, 3))).toEqual([]);
  expect(gr.shortestDist(0, 3)).toBe(Infinity);
  expect(gr.shortestSteps(0, 3)).toBe(Infinity);

  // cleanup
  gr.unlink2(1, 2);
  gr.unlink2(1, 3);
  gr.unlink2(2, 3);

  expect(Array.from(gr.pathOn(1, 3))).toEqual([]);
});

test('Graph: directed unweighted loop', () => {
  //    (C)---->(D)
  // 1 ^      1    \ 1
  //  /             v
  // (B)           (E)
  //  ^             /
  // 1 \     1     v 1
  //    (A)<----(F)

  const gr = new $.Graph();
  gr.link('A', 'B');
  gr.link('B', 'C');
  gr.link('C', 'D');
  gr.link('D', 'E');
  gr.link('E', 'F');
  gr.link('F', 'A');

  expect(Iter.from(gr.dests('D')).toObject()).toEqual({
    A: {via: 'B', dist: 3, count: 3},
    B: {via: 'C', dist: 2, count: 2},
    C: {via: 'D', dist: 1, count: 1},
    E: {via: 'F', dist: 5, count: 5},
    F: {via: 'A', dist: 4, count: 4},
  });
});

test('Graph: undirected unweighted loop', () => {
  //    (C)-----(D)
  // 1 /      1    \ 1
  //  /             \
  // (B)           (E)
  //  \             /
  // 1 \     1     / 1
  //    (A)-----(F)

  const gr = new $.Graph();
  gr.link2('A', 'B');
  gr.link2('B', 'C');
  gr.link2('C', 'D');
  gr.link2('D', 'E');
  gr.link2('E', 'F');
  gr.link2('F', 'A');

  expect(Iter.from(gr.dests('D')).toObject()).toEqual({
    A: {via: 'B', dist: 3, count: 3},
    B: {via: 'C', dist: 2, count: 2},
    C: {via: 'D', dist: 1, count: 1},
    E: {via: 'D', dist: 1, count: 1},
    F: {via: 'E', dist: 2, count: 2},
  });
});

test('Graph: undirected unweighted branch', () => {
  //             (D)
  // (A)-(B)-(C)<   >(F)-(G)-(H)
  //             (E)

  const gr = new $.Graph();
  gr.link2('A', 'B');
  gr.link2('B', 'C');
  gr.link2('C', 'D');
  gr.link2('C', 'E');
  gr.link2('D', 'F');
  gr.link2('E', 'F');
  gr.link2('F', 'G');
  gr.link2('G', 'H');

  expect(Iter.from(gr.dests('G')).toObject()).toEqual({
    A: {via: 'B', dist: 5, count: 5},
    B: {via: 'C', dist: 4, count: 4},
    C: {via: 'E', dist: 3, count: 3},
    D: {via: 'F', dist: 2, count: 2},
    E: {via: 'F', dist: 2, count: 2},
    F: {via: 'G', dist: 1, count: 1},
    H: {via: 'G', dist: 1, count: 1},
  });

  gr.unlink2('D', 'F');

  expect(Iter.from(gr.dests('G')).toObject()).toEqual({
    A: {via: 'B', dist: 5, count: 5},
    B: {via: 'C', dist: 4, count: 4},
    C: {via: 'E', dist: 3, count: 3},
    D: {via: 'C', dist: 4, count: 4},
    E: {via: 'F', dist: 2, count: 2},
    F: {via: 'G', dist: 1, count: 1},
    H: {via: 'G', dist: 1, count: 1},
  });

  expect(Array.from(gr.pathOn('A', 'H'))).toEqual(['A', 'B', 'C', 'E', 'F', 'G', 'H']);
  expect(Array.from(gr.pathOn('D', 'G'))).toEqual(['D', 'C', 'E', 'F', 'G']);
});

test('Graph: wikipedia', () => {
  const gr = new $.Graph();
  gr.link2(4, 5, 6);
  gr.link2(6, 5, 9);
  gr.link2(3, 6, 2);
  gr.link2(3, 4, 11);
  gr.link2(2, 4, 15);
  gr.link2(2, 3, 10);
  gr.link2(1, 6, 14);
  gr.link2(1, 3, 9);
  gr.link2(1, 2, 7);
  expect(Array.from(gr.pathOn(1, 5))).toEqual([1, 3, 6, 5]);
  expect(gr.shortestDist(1, 5)).toBe(20);
  expect(gr.shortestSteps(1, 5)).toBe(3);
});
