const AsIt = require('./map');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('AsIt_.map: map iterator: echo', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, 8, 3, 1]));
  wrapped.map();
  expect(await asItArray(wrapped)).toEqual([4, 0, 8, 3, 1]);
});

test('AsIt_.map: map iterator: 1 function', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, 8, 3, 1]));
  wrapped.map(v => -v);
  expect(await asItArray(wrapped)).toEqual([-4, -0, -8, -3, -1]);
});

test('AsIt_.map: map iterator: several functions', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, 8, 3, 1]));
  wrapped.map(v => v + v, async v => -v);
  expect(await asItArray(wrapped)).toEqual([-8, -0, -16, -6, -2]);
});

test('AsIt_.map: stretch', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, 8]));
  wrapped.map(3);
  expect(await asItArray(wrapped)).toEqual([[4, 4, 4], [0, 0, 0], [8, 8, 8]]);
});

test('AsIt_.map: map and lag', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, [8, 9], 3, 1]));
  wrapped.map(-2);
  expect(await asItArray(wrapped)).toEqual([, , 4, 0, [8, 9]]);
});

test('AsIt_.maps: map multi iterator: echo', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, 8, 3, 1]));
  wrapped.maps();
  expect(await asItArray(wrapped)).toEqual([4, 0, 8, 3, 1]);
});

test('AsIt_.maps: map multi iterator', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, 8, 3, 1]));
  wrapped.maps(v => v + v, v => -v, async v => !v ? null : v < -6 ? [v, -v] : v);
  expect(await asItArray(wrapped)).toEqual([-8, 8, -16, 16, -6, -2]);
});

test('AsIt_.maps: stretch', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, 8, 3, 1]));
  wrapped.maps(2);
  expect(await asItArray(wrapped)).toEqual([4, 4, 0, 0, 8, 8, 3, 3, 1, 1]);
});

test('AsIt_.maps: map multi and skip last', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, [8, 9], 3, 1]));
  wrapped.maps(-2);
  expect(await asItArray(wrapped)).toEqual([4, 0, 8, 9]);
});

test('AsIt_.mapTo: map to entry: echo', async () => {
  const wrapped = new AsIt(AsIt.getIter([4, 0, 8, 3, 1]));
  wrapped.mapTo();
  expect(await asItArray(wrapped)).toEqual([4, 0, 8, 3, 1]);
});

test('AsIt_.mapTo: map to inwalk', async () => {
  const wrapped = new AsIt(AsIt.getIter([[{a: [4]}, 1], [{a: [8]}, 2], [, 4], null]));
  wrapped.mapTo([0, 'a', 0], a => a && a[1] ? a[1] + 1 : 'def');
  expect(await asItArray(wrapped)).toEqual([[{a: [2]}, 1], [{a: [3]}, 2], [{a: [5]}, 4], null]);
});

test('AsIt_.mapAt: map by field', async () => {
  const wrapped = new AsIt(AsIt.getIter([['a', 1], ['b', 2], ['c', 4], null]));
  wrapped.mapAt(0, async key => key ? key.toString().toUpperCase() : 'def');
  expect(await asItArray(wrapped)).toEqual([['A', 1], ['B', 2], ['C', 4], null]);
});

test('AsIt_.mapAt: map by inwalk', async () => {
  const wrapped = new AsIt(AsIt.getIter([[{a: [4]}, 1], [{a: [8]}, 2], [, 4], null]));
  wrapped.mapAt([0, 'a', 0], async key => key ? key.toString() : 'def');
  expect(await asItArray(wrapped)).toEqual([[{a: ['4']}, 1], [{a: ['8']}, 2], [{a: ['def']}, 4], null]);
});

test('AsIt_.mapKeys: map key in entries', async () => {
  const wrapped = new AsIt(AsIt.getIter([[4, 1], [8, 2]]));
  wrapped.mapKeys(([key]) => key.toString());
  expect(await asItArray(wrapped)).toEqual([['4', 1], ['8', 2]]);
});

test('AsIt_.mapValues: map value in entries', async () => {
  const wrapped = new AsIt(AsIt.getIter([[4, 1], [8, 2]]));
  wrapped.mapValues(async ([, value]) => value.toString());
  expect(await asItArray(wrapped)).toEqual([[4, '1'], [8, '2']]);
});

test('AsIt_.mapKey: map key in entries', async () => {
  const wrapped = new AsIt(AsIt.getIter([[4, 1], [8, 2]]));
  wrapped.mapKey(async (key) => key.toString());
  expect(await asItArray(wrapped)).toEqual([['4', 1], ['8', 2]]);
});

test('AsIt_.mapValue: map value in entries', async () => {
  const wrapped = new AsIt(AsIt.getIter([[4, 1], [8, 2]]));
  wrapped.mapValue((value) => value.toString());
  expect(await asItArray(wrapped)).toEqual([[4, '1'], [8, '2']]);
});

test('AsIt_.gen: apply generator', async () => {
  const wrapped = new AsIt(AsIt.getIter([1, 2, 3]));
  wrapped.gen(async function* (iter, arg) { for await (const item of iter) yield `${arg}${item}`; }, 'z');
  expect(await asItArray(wrapped)).toEqual(['z1', 'z2', 'z3']);
});

test('AsIt_.save, AsIt_.load: save/load items', async () => {
  const wrap = new AsIt(AsIt.getIter([1, 2, 3]));
  const strs = [];
  const sqrs = await asItArray(wrap.save(1).map(v => v.toString()).map(v => strs.push(v)).load(1).map(v => v*v));
  expect(strs).toEqual(['1', '2', '3']);
  expect(sqrs).toEqual([1, 4, 9]);
});
