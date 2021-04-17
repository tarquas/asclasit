const AsIt = require('./object');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('AsIt.objectsKeys: get keys iterator of objects', async () => {
  const keys = AsIt.objectsKeys({a: 1, b: 2}, {c: 3}, null);
  expect(await asItArray(keys)).toEqual(['a', 'b', 'c']);
});

test('AsIt.objectsValues: get values iterator of objects', async () => {
  const values = AsIt.objectsValues({a: 1, b: 2}, {c: 3}, null);
  expect(await asItArray(values)).toEqual([1, 2, 3]);
});

test('AsIt.objectsEntries: get keys iterator of objects', async () => {
  const entries = AsIt.objectsEntries({a: 1, b: 2}, {c: 3}, null);
  expect(await asItArray(entries)).toEqual([['a', 1], ['b', 2], ['c', 3]]);
});

test('AsIt.keys: get keys iterator', async () => {
  const keys = AsIt.keys(null,
    new Set([1, 2]),
    new Map([['a', 3], ['b', 4]]),
    [5, ['c', 6]],
    {d: 7, e: 8},
    () => -1, AsIt.getIter([11, 12, [13, 14]])
  );

  expect(await asItArray(keys)).toEqual([
    1, 2,
    'a', 'b',
    0, 1,
    'd', 'e',
    -1, 11, 12, 13,
  ]);
});

test('AsIt.values: get values iterator', async () => {
  const values = AsIt.values(null,
    new Set([1, 2]),
    new Map([['a', 3], ['b', 4]]),
    [5, ['c', 6]], 
    {d: 7, e: 8},
    () => -2, AsIt.getIter([11, 12, [13, 14]])
  );

  expect(await asItArray(values)).toEqual([
    1, 2,
    3, 4,
    5, ['c', 6],
    7, 8,
    -2, 11, 12, 14,
  ]);
});

test('AsIt.entries: get entries iterator', async () => {
  const entries = AsIt.entries(null,
    new Set([1, 2]),
    new Map([['a', 3], ['b', 4]]),
    [5, ['c', 6]],
    {d: 7, e: 8},
    () => '#', AsIt.getIter([11, 12, [13, 14]])
  );

  expect(await asItArray(entries)).toEqual([
    [1, 1], [2, 2],
    ['a', 3], ['b', 4],
    [0, 5], [1, ['c', 6]],
    ['d', 7], ['e', 8],
    ['#', '#'], [11, 11], [12, 12], [13, 14],
  ]);
});
