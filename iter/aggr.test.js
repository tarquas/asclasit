const Iter = require('./aggr');

test('Iter_.toRecentGroup: default', () => {
  const src = new Iter(Iter.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  expect(src.toRecentGroup(3)).toEqual({a: {count: 2}, c: {count: 1}, d: {custom: 1}});
});

test('Iter_.toRecentGroup: unlimited', () => {
  const src = new Iter(Iter.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  expect(src.toRecentGroup({})).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}, d: {custom: 1}});
});

test('Iter_.toRecentGroup: stopOnDropped', () => {
  const src = new Iter(Iter.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  const opts = {stopOnDropped: 1};
  expect(src.toRecentGroup(3, opts)).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}});
  expect(opts).toEqual({stopOnDropped: 1, stopped: 'dropped', nKeys: 3, nDropped: 1, idx: 4});
});

test('Iter_.toRecentGroup: stopOnCond', () => {
  const src = new Iter(Iter.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  const opts = {stopOnCond: group => group.count > 0};
  expect(src.toRecentGroup(3, opts)).toEqual({a: {count: 1}, b: {count: 1}, c: {count: 1}});
  expect(opts.stopped).toEqual('cond');
});

test('Iter_.toRecentGroup: sort', () => {
  const src = new Iter(Iter.getIter([200, 100, 50, 20, 10, [5, 'custom']]));
  expect(src.toRecentGroup(3, {skip: 1})).toEqual({20: {count: 1}, 50: {count: 1}, 100: {count: 1}});
});

test('Iter_.toRecentGroup: Array', () => {
  const src = new Iter(Iter.getIter([['a', 1], ['b', 2], ['c', 3], ['a', 4], ['d', 5]]));
  expect(src.toRecentGroup(3, {group: Array})).toEqual({a: [1, 4], c: [3], d: [5]});
});

test('Iter_.toOrderGroup: default', () => {
  const src = new Iter(Iter.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  expect(src.toOrderGroup(3)).toEqual({b: {count: 1}, c: {count: 1}, d: {custom: 1}});
});

test('Iter_.toOrderGroup: unlimited', () => {
  const src = new Iter(Iter.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  expect(src.toOrderGroup({})).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}, d: {custom: 1}});
});

test('Iter_.toOrderGroup: sort', () => {
  const src = new Iter(Iter.getIter([200, 100, 50, 20, 10, [5, 'custom']]));
  const group = src.toOrderGroup(3, {skip: 1});
  expect(group).toEqual({20: {count: 1}, 50: {count: 1}, 100: {count: 1}});
  expect(Object.keys(group)).toEqual(['20', '50', '100']);
});

test('Iter_.toOrderGroup: Array', () => {
  const src = new Iter(Iter.getIter([['c', 0], ['a', 1], ['b', 2], ['c', 3], ['a', 4], ['d', 5]]));
  expect(src.toOrderGroup(3, {skip: 1, group: Array})).toEqual({b: [2], c: [3], d: [5]});
});

test('Iter_.toOrderGroup: stopOnDropped', () => {
  const src = new Iter(Iter.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  const opts = {stopOnDropped: 1};
  expect(src.toOrderGroup(3, opts)).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}});
  expect(opts).toEqual({stopOnDropped: 1, stopped: 'dropped', nKeys: 3, nDropped: 1, idx: 4});
});

test('Iter_.toOrderGroup: stopOnCond', () => {
  const src = new Iter(Iter.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  const opts = {stopOnCond: group => group.count > 0};
  expect(src.toOrderGroup(3, opts)).toEqual({a: {count: 1}, b: {count: 1}, c: {count: 1}});
  expect(opts.stopped).toEqual('cond');
});
