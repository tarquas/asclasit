const AsIt = require('./aggr');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('AsIt_.toRecentGroup: default', async () => {
  const src = new AsIt(AsIt.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  expect(await src.toRecentGroup(3)).toEqual({a: {count: 2}, c: {count: 1}, d: {custom: 1}});
});

test('AsIt_.toRecentGroup: unlimited', async () => {
  const src = new AsIt(AsIt.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  expect(await src.toRecentGroup({})).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}, d: {custom: 1}});
});

test('AsIt_.toRecentGroup: stopOnDropped', async () => {
  const src = new AsIt(AsIt.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  const opts = {stopOnDropped: 1};
  const to = await src.toRecentGroup(3, opts);
  expect(to).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}});
  expect(opts).toEqual({stopOnDropped: 1, stopped: 'dropped', nKeys: 3, nDropped: 1, idx: 4, to});
});

test('AsIt_.toRecentGroup: stopOnCond', async () => {
  const src = new AsIt(AsIt.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  const opts = {stopOnCond: group => group.count > 0};
  expect(await src.toRecentGroup(3, opts)).toEqual({a: {count: 1}, b: {count: 1}, c: {count: 1}});
  expect(opts.stopped).toEqual('cond');
});

test('AsIt_.toRecentGroup: sort', async () => {
  const src = new AsIt(AsIt.getIter([200, 100, 50, 20, 10, [5, 'custom']]));
  expect(await src.toRecentGroup(3, {skip: 1})).toEqual({20: {count: 1}, 50: {count: 1}, 100: {count: 1}});
});

test('AsIt_.toRecentGroup: Array', async () => {
  const src = new AsIt(AsIt.getIter([['a', 1], ['b', 2], ['c', 3], ['a', 4], ['d', 5]]));
  expect(await src.toRecentGroup(3, {group: Array})).toEqual({a: [1, 4], c: [3], d: [5]});
});

test('AsIt_.toOrderGroup: default', async () => {
  const src = new AsIt(AsIt.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  expect(await src.toOrderGroup(3)).toEqual({b: {count: 1}, c: {count: 1}, d: {custom: 1}});
});

test('AsIt_.toOrderGroup: unlimited', async () => {
  const src = new AsIt(AsIt.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  expect(await src.toOrderGroup({})).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}, d: {custom: 1}});
});

test('AsIt_.toOrderGroup: sort', async () => {
  const src = new AsIt(AsIt.getIter([200, 100, 50, 20, 10, [5, 'custom']]));
  const group = await src.toOrderGroup(3, {skip: 1});
  expect(group).toEqual({20: {count: 1}, 50: {count: 1}, 100: {count: 1}});
  expect(Object.keys(group)).toEqual(['20', '50', '100']);
});

test('AsIt_.toOrderGroup: Array', async () => {
  const src = new AsIt(AsIt.getIter([['c', 0], ['a', 1], ['b', 2], ['c', 3], ['a', 4], ['d', 5]]));
  expect(await src.toOrderGroup(3, {skip: 1, group: Array})).toEqual({b: [2], c: [3], d: [5]});
});

test('AsIt_.toOrderGroup: stopOnDropped', async () => {
  const src = new AsIt(AsIt.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  const opts = {stopOnDropped: 1};
  const to = await src.toOrderGroup(3, opts);
  expect(to).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}});
  expect(opts).toEqual({stopOnDropped: 1, stopped: 'dropped', nKeys: 3, nDropped: 1, idx: 4, to});
});

test('AsIt_.toOrderGroup: stopOnCond', async () => {
  const src = new AsIt(AsIt.getIter(['a', 'b', 'c', 'a', ['d', 'custom']]));
  const opts = {stopOnCond: group => group.count > 0};
  expect(await src.toOrderGroup(3, opts)).toEqual({a: {count: 1}, b: {count: 1}, c: {count: 1}});
  expect(opts.stopped).toEqual('cond');
});

test('AsIt_.recentGroup, orderGroup: nosort, sort', async () => {
  const from = ['a', 'b', 'c', 'a', ['d', 'custom']];
  const src = new AsIt(AsIt.getIter(from));
  const recent = {};
  const order = {};
  const group = await asItArray(src.recentGroup(recent, {}).orderGroup(order, {}));
  expect(group).toEqual(from);
  expect(order).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}, d: {custom: 1}});
  expect(Object.keys(order)).toEqual(['a', 'b', 'c', 'd']);
  expect(recent).toEqual({a: {count: 2}, b: {count: 1}, c: {count: 1}, d: {custom: 1}});
  expect(Object.keys(recent)).toEqual(['b', 'c', 'a', 'd']);
});
