const $ = require('./object');

const symbol1 = Symbol('$.diff.test1');
const symbol2 = Symbol('$.diff.test2');
const symbol3 = Symbol('$.diff.test3');

const from = {
  number: {ae: 1, an: 2},
  string: {be: '2', bn: 'a'},
  symbol: {ce: symbol1, cn: symbol2},
  inclusive: {ex: 1, ey: 1},
  exclusive: {ey: 1},
  de: true, dn: true,
  fe: undefined, fn: null,
  ge: null, gn: undefined,
  array: {ae: [1, 2, 3], an: [4, 5, 6], ax: ['m', 'n']},
  set: {sn: new Set(['a', 'b', 'c']), se: new Set(['x', 'y', 'z'])},
  map: {me: new Map([['x', 1], ['y', 2], ['z', 3]]), mn: new Map([['a', 1], ['b', -2], ['c', 3]])},
  empty: {},
  object: Object.setPrototypeOf({x: 1, y: 2}, null),
  types: {field: new Map([['a', '1']])},
  custom: {pq: $.PQ.from([1, 2, 3], {sort: $.numSort, revSort: $.numSort})},
  date: {de: new Date('2020-01-01'), dn: new Date('2020-01-02'), df: new Date('2020-01-04')},
};

const to = {
  number: {ae: 1, an: 3},
  string: {be: '2', bn: 'b'},
  symbol: {ce: symbol1, cn: symbol3},
  inclusive: {ey: 1},
  exclusive: {ex: 1, ey: 1},
  de: true, dn: false,
  fe: undefined, fn: undefined,
  ge: null, gn: null,
  array: {ae: [1, 2, 3], an: [4, -5, 6], ax: ['m']},
  set: {se: new Set(['x', 'y', 'z']), sn: new Set(['a', 'd'])},
  map: {me: new Map([['x', 1], ['y', 2], ['z', 3]]), mn: new Map([['a', 1], ['d', 2], ['b', 2]])},
  empty: {},
  object: {z: 3, y: 4},
  types: {field: new Set(['a'])},
  custom: {pq: $.PQ.from([1, 2, 3], {sort: $.numSort, revSort: $.numSort})},
  date: {de: new Date('2020-01-01'), dn: new Date('2020-01-03'), dt: new Date('2020-01-05')},
};

test('$.diff: injecive difference', () => {
  const diff = {
    number: {an: 3}, string: {bn: 'b'}, symbol: {cn: symbol3},
    exclusive: {ex: 1},
    dn: false, fn: undefined, gn: null,
    array: {an: [, -5, ]},
    set: {sn: new Set(['d'])},
    map: {mn: new Map([['d', 2], ['b', 2]])},
    object: {z: 3, y: 4},
    types: {field: new Set(['a'])},
    date: {dn: new Date('2020-01-03'), dt: new Date('2020-01-05')},
  };

  expect($.diff(from, to)).toEqual(diff);
});

test('$.diff: bijective difference (sym)', () => {
  const diff = {
    number: {an: 3}, string: {bn: 'b'}, symbol: {cn: symbol3},
    inclusive: {ex: 1},
    exclusive: {ex: 1},
    dn: false, fn: undefined, gn: null,
    array: {an: [, -5, ], ax: [, 'n']},
    set: {sn: new Set(['d', 'b', 'c'])},
    map: {mn: new Map([['d', 2], ['b', 2], ['c', 3]])},
    object: {x: 1, z: 3, y: 4},
    types: {field: new Set(['a'])},
    date: {dn: new Date('2020-01-03'), df: new Date('2020-01-04'), dt: new Date('2020-01-05')},
  };

  expect($.diff(from, to, {back: true, sym: true})).toEqual(diff);
});

test('$.diff: half-bijective difference (void value)', () => {
  const diff = {
    number: {an: 3}, string: {bn: 'b'}, symbol: {cn: symbol3},
    inclusive: {ex: 'diff'},
    exclusive: {ex: 1},
    dn: false, fn: undefined, gn: null,
    array: {an: [, -5, ], ax: [, 'diff']},
    set: {sn: new Set(['d'])},
    map: {mn: new Map([['d', 2], ['b', 2], ['c', 'diff']])},
    object: {x: 'diff', z: 3, y: 4},
    types: {field: new Set(['a'])},
    date: {dn: new Date('2020-01-03'), df: 'diff', dt: new Date('2020-01-05')},
  };

  expect($.diff(from, to, {back: true, void: 'diff'})).toEqual(diff);
});

test('$.diff: primitives', () => {
  expect($.diff(1, 2)).toBe(2);
  expect($.diff(1, 1)).toBe(undefined);
});

test('$.diff: circular', () => {
  const a = {a: {}};
  const b = {a: {a: {}}};
  a.a.a = a;
  b.a.a.a = a;
  expect($.diff(a, a)).toBe(undefined);
  expect($.diff(a, b)).toBe(undefined);
  expect($.diff(b, b)).toBe(undefined);
});

test('$.diff: half-circular', () => {
  const a = {a: {}};
  const b = {a: {a: {a: {a: {a: {a: {a: {b: 1}}}}}}}};
  a.a.a = a;
  expect($.diff(a, b, {back: true, sym: true})).toEqual({a: {a: {a: {a: {a: {a: {a: {a: a, b: 1}}}}}}}});
});

test('$.diff: cross-circular', () => {
  const a = {a: {}};
  const b = {a: {a: {}}};
  a.a.a = b;
  b.a.a.a = a;
  expect($.diff(a, a)).toBe(undefined);
  expect($.diff(a, b)).toBe(undefined);
  expect($.diff(b, b)).toBe(undefined);
});
