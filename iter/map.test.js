const Iter = require('./map');

test('Iter_.map: map iterator: echo', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map();
  expect(Array.from(wrapped)).toEqual([4, 0, 8, 3, 1]);
});

test('Iter_.map: map iterator: 1 function', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map(v => -v);
  expect(Array.from(wrapped)).toEqual([-4, -0, -8, -3, -1]);
});

test('Iter_.map: map iterator: several functions', () => {
  const wrapped = new Iter(Iter.getIter([4, 0, 8, 3, 1]));
  wrapped.map(v => v + v, v => -v);
  expect(Array.from(wrapped)).toEqual([-8, -0, -16, -6, -2]);
});

//mapTo

test('Iter_.mapAt: map by inwalk', () => {
  const wrapped = new Iter(Iter.getIter([[{a: [4]}, 1], [{a: [8]}, 2], [, 4], null]));
  wrapped.mapAt([0, 'a', 0], key => key ? key.toString() : 'def');
  expect(Array.from(wrapped)).toEqual([[{a: ['4']}, 1], [{a: ['8']}, 2], [{a: ['def']}, 4], null]);
});

test('Iter_.mapKeys: map key in entries', () => {
  const wrapped = new Iter(Iter.getIter([[4, 1], [8, 2]]));
  wrapped.mapKeys(key => key.toString());
  expect(Array.from(wrapped)).toEqual([['4', 1], ['8', 2]]);
});

test('Iter_.mapValues: map value in entries', () => {
  const wrapped = new Iter(Iter.getIter([[4, 1], [8, 2]]));
  wrapped.mapValues(value => value.toString());
  expect(Array.from(wrapped)).toEqual([[4, '1'], [8, '2']]);
});
