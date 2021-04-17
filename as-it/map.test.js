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

//mapTo

test('AsIt_.mapAt: map by inwalk', async () => {
  const wrapped = new AsIt(AsIt.getIter([[{a: [4]}, 1], [{a: [8]}, 2], [, 4], null]));
  wrapped.mapAt([0, 'a', 0], async key => key ? key.toString() : 'def');
  expect(await asItArray(wrapped)).toEqual([[{a: ['4']}, 1], [{a: ['8']}, 2], [{a: ['def']}, 4], null]);
});

test('AsIt_.mapKey: map key in entries', async () => {
  const wrapped = new AsIt(AsIt.getIter([[4, 1], [8, 2]]));
  wrapped.mapKey(key => key.toString());
  expect(await asItArray(wrapped)).toEqual([['4', 1], ['8', 2]]);
});
