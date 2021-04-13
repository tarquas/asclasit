const $ = require('./map');

test('$.echo: map same', () => {
  expect([1, 'a', {a: 1}, [5]].map($.echo)).toEqual([1, 'a', {a: 1}, [5]]);
});

test('$.aecho: map same async', async () => {
  const promises = [1, 'a', {a: 1}, [5]].map($.aecho);
  expect(promises[0] instanceof Promise).toBe(true);
  expect(await Promise.all(promises)).toEqual([1, 'a', {a: 1}, [5]]);
});

test('$.null: map null', () => {
  expect([1, 'a', {a: 1}, [5]].map($.null)).toEqual([null, null, null, null]);
});

test('$.anull: map null async', async () => {
  const promises = [1, 'a', {a: 1}, [5]].map($.anull);
  expect(promises[0] instanceof Promise).toBe(true);
  expect(await Promise.all(promises)).toEqual([null, null, null, null]);
});

test('$.not: map boolean not', () => {
  expect([1, undefined, 0, 'a', null, {a: 1}, [5]].map($.not)).toEqual([false, true, true, false, true, false, false]);
});

test('$.anot: map boolean not async', async () => {
  const promises = [1, undefined, 0, 'a', null, {a: 1}, [5]].map($.anot);
  expect(promises[0] instanceof Promise).toBe(true);
  expect(await Promise.all(promises)).toEqual([false, true, true, false, true, false, false]);
});

test('$.neg: map negative', () => {
  expect([1, undefined, 0, 'a', null, {a: 1}, [5]].map($.neg)).toEqual([-1, NaN, -0, NaN, -0, NaN, -5]);
});

test('$.anot: map negative', async () => {
  const promises = [1, 2].map($.aneg);
  expect(promises[0] instanceof Promise).toBe(true);
  expect(await Promise.all(promises)).toEqual([-1, -2]);
});

test('$.bound: map bound context', () => {
  expect([1, 2].map($.bound.bind({a: 1}))).toEqual([{a: 1}, {a: 1}]);
});

test('$.abound: map bound context async', async () => {
  const promises = [1, 2].map($.abound.bind({a: 2}));
  expect(promises[0] instanceof Promise).toBe(true);
  expect(await Promise.all(promises)).toEqual([{a: 2}, {a: 2}]);
});
