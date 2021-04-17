const Iter = require('./object');

test('Iter.objectsKeys: get keys iterator of objects', () => {
  const keys = Iter.objectsKeys({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(keys)).toEqual(['a', 'b', 'c']);
});

test('Iter.objectsValues: get values iterator of objects', () => {
  const values = Iter.objectsValues({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(values)).toEqual([1, 2, 3]);
});

test('Iter.objectsEntries: get keys iterator of objects', () => {
  const entries = Iter.objectsEntries({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(entries)).toEqual([['a', 1], ['b', 2], ['c', 3]]);
});

test('Iter.keys: get keys iterator', () => {
  const keys = Iter.keys(null,
    new Set([1, 2]),
    new Map([['a', 3], ['b', 4]]),
    [5, ['c', 6]],
    {d: 7, e: 8},
    () => -1, Iter.getIter([11, 12, [13, 14]])
  );

  expect(Array.from(keys)).toEqual([
    1, 2,
    'a', 'b',
    0, 1,
    'd', 'e',
    -1, 11, 12, 13,
  ]);
});

test('Iter.values: get values iterator', () => {
  const values = Iter.values(null,
    new Set([1, 2]),
    new Map([['a', 3], ['b', 4]]),
    [5, ['c', 6]], 
    {d: 7, e: 8},
    () => -2, Iter.getIter([11, 12, [13, 14]])
  );

  expect(Array.from(values)).toEqual([
    1, 2,
    3, 4,
    5, ['c', 6],
    7, 8,
    -2, 11, 12, 14,
  ]);
});

test('Iter.entries: get entries iterator', () => {
  const entries = Iter.entries(null,
    new Set([1, 2]),
    new Map([['a', 3], ['b', 4]]),
    [5, ['c', 6]],
    {d: 7, e: 8},
    () => '#', Iter.getIter([11, 12, [13, 14]])
  );

  expect(Array.from(entries)).toEqual([
    [1, 1], [2, 2],
    ['a', 3], ['b', 4],
    [0, 5], [1, ['c', 6]],
    ['d', 7], ['e', 8],
    ['#', '#'], [11, 11], [12, 12], [13, 14],
  ]);
});
