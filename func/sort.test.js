const $ = require('./sort');

test('$.sort: sort by numbers', () => {
  const arr = [6, 1, 9.9, 22, 1, 0];
  const sorted = arr.sort($.sort);
  expect(sorted).toEqual([0, 1, 1, 6, 9.9, 22]);
});

test('$.sort: sort by strings', () => {
  const arr = ['6', '1', '9.9', '22', '1', '0'];
  const sorted = arr.sort($.sort);
  expect(sorted).toEqual(['0', '1', '1', '22', '6', '9.9']);
});

test('$.numSort: sort by numbers', () => {
  const arr = [6, 1, 9.9, 2, 1, 0];
  const sorted = arr.sort($.numSort);
  expect(sorted).toEqual([0, 1, 1, 2, 6, 9.9]);
});

test('$.safeNumSort: zeroes if not numbers', () => {
  const arr = [6, {a: 1}, -3, 1, 9.9, 'a', '5', 2, null, 1, Infinity, 0];
  const sorted = arr.sort($.safeNumSort);
  expect(sorted).toEqual([-3, {a: 1}, 'a', null, 0, 1, 1, 2, '5', 6, 9.9, Infinity]);
});

test('$.sortKey: sort by entry key', () => {
  const arr = [[6, 9], [1, 8, 'a'], [9.9, {a: 1}], [22, 'x'], [1], [0]];
  const sorted = arr.sort($.sortKey);
  expect(sorted).toEqual([[0], [1, 8, 'a'], [1], [6, 9], [9.9, {a: 1}], [22, 'x']]);
});

test('$.sort: sort by entry key', () => {
  const arr = [[6, 9], [1, 8, 'a'], [9.9, {a: 1}], [22, 'x'], [1], [0]];
  const sorted = arr.sort($.sort_('0'));
  expect(sorted).toEqual([[0], [1, 8, 'a'], [1], [6, 9], [9.9, {a: 1}], [22, 'x']]);
});

test('$.sort: sort by symbol', () => {
  const S = Symbol('S');
  const arr = [{[S]: 2}, {[S]: 1}];
  const sorted = arr.sort($.sort_(S));
  expect(sorted).toEqual([{[S]: 1}, {[S]: 2}]);
});

test('$.sort_: sort by functional', () => {
  const arr = [[{a: 6}, 9], [{a: 1}, 8, 'a'], [{a: 9.9}, {a: 1}], [{a: 22}, 'x'], [{a: 1}], [{x: 0, a: 0}]];
  const sorted = arr.sort($.sort_('0', 'a'));
  expect(sorted).toEqual([[{x: 0, a: 0}], [{a: 1}, 8, 'a'], [{a: 1}], [{a: 6}, 9], [{a: 9.9}, {a: 1}], [{a: 22}, 'x']]);
});

test('$.lastElem: get last element / element back from end', () => {
  expect($.lastElem({})).toBe(null);
  expect($.lastElem([1, 2, 3])).toBe(3);
  expect($.lastElem([1, 2, 3, 4, 5], 1)).toBe(4);
});
