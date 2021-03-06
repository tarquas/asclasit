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

test('$._: force value', () => {
  expect([1, 'a', {a: 1}, [5]].map($._(5))).toEqual([5, 5, 5, 5]);
});

test('$.anull: map null async', async () => {
  const promises = [1, 'a', {a: 1}, [5]].map($.anull);
  expect(promises[0] instanceof Promise).toBe(true);
  expect(await Promise.all(promises)).toEqual([null, null, null, null]);
});

test('$.ifNull_: call function if argument is nullish', () => {
  const def = $.ifNull_(() => 5);
  expect(def(undefined)).toBe(5);
  expect(def(null)).toBe(5);
  expect(def(3)).toBe(3);
});

test('$.defNull_: return default value if argument is nullish', () => {
  const def = $.defNull_(5);
  expect(def(undefined)).toBe(5);
  expect(def(null)).toBe(5);
  expect(def(3)).toBe(3);
});

test('$.not: map boolean not', () => {
  expect([1, undefined, 0, 'a', null, {a: 1}, [5]].map($.not)).toEqual([false, true, true, false, true, false, false]);
});

test('$.isNullish: is null or undefined', () => {
  expect([1, undefined, 0, 'a', null, {a: 1}, [5]].map($.isNullish)).toEqual([false, true, false, false, true, false, false]);
});

test('$.isNotNullish: is not null or undefined', () => {
  expect([1, undefined, 0, 'a', null, {a: 1}, [5]].map($.isNotNullish)).toEqual([true, false, true, true, false, true, true]);
});

test('$.not_: not func result', () => {
  expect([1, '2', false].map($.not_(v => typeof v === 'string'))).toEqual([true, false, true]);
});

test('$.anot: map boolean not async', async () => {
  const promises = [1, undefined, 0, 'a', null, {a: 1}, [5]].map($.anot);
  expect(promises[0] instanceof Promise).toBe(true);
  expect(await Promise.all(promises)).toEqual([false, true, true, false, true, false, false]);
});

test('$.neg: map negative', () => {
  expect([1, undefined, 0, 'a', null, {a: 1}, [5]].map($.neg)).toEqual([-1, NaN, -0, NaN, -0, NaN, -5]);
});

test('$.neg_: negate func result', () => {
  expect([1, 2, 3].map($.neg_(v => v * 2))).toEqual([-2, -4, -6]);
});

test('$.aneg: map negative', async () => {
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

test('$.false: map false', () => {
  expect($.false('smth')).toBe(false);
});

test('$.debug_: tee to function', () => {
  let captured;
  const f = (v) => { captured = v; };
  const debug = $.debug_(f);
  expect(debug('smth')).toBe('smth');
  expect(captured).toBe('smth');
});

const deep = [
  {a1: {b1: 1, b2: 2}, a2: {b1: 3, b2: 4}},
  {a1: {b1: 5, b2: 6}, a2: {b1: 7, b2: 8}},
  {a1: 4, a2: 6},
  null,
];

test('$.in_: level 1 object inwalk', () => {
  expect(deep.map($.in_('a1'))).toEqual([deep[0].a1, deep[1].a1, 4, null]);
});

test('$.in_: object inwalk', () => {
  expect(deep.map($.in_('a1', 'b1'))).toEqual([deep[0].a1.b1, deep[1].a1.b1, undefined, null]);
});

test('$.key_: entry key by function', () => {
  const values = [7, 3, -4, 8, 'a', null, ['x', 'y'], true];
  const mapped = values.map($.key_(v => v + 1));
  expect(mapped).toEqual([[8, 7], [4, 3], [-3, -4], [9, 8], ['a1', 'a'], [1, null], ['x', 'y'], [2, true]]);
});

test('$.keyin_: entry key by object inwalk', () => {
  const mapped = deep.map($.keyin_('a1', 'b1'));
  expect(mapped).toEqual([[1, deep[0]], [5, deep[1]], [, deep[2]], [null, deep[3]]]);
});

test('$.inKey: first element (index 0)', () => {
  expect([['a', 1], ['b', 2], null].map($.inKey)).toEqual(['a', 'b', null]);
});

test('$.value_: entry value by function', () => {
  const keys = [7, 3, -4, 8, 'a', null, ['a', 'b'], true];
  const mapped = keys.map($.value_(v => v + 1));
  expect(mapped).toEqual([[7, 8], [3, 4], [-4, -3], [8, 9], ['a', 'a1'], [null, 1], ['a', 'b'], [true, 2]]);
});

test('$.valuein_: entry value by object inwalk', () => {
  const mapped = deep.map($.valuein_('a1', 'b1'));
  expect(mapped).toEqual([[deep[0], 1], [deep[1], 5], [deep[2], undefined], [deep[3], null]]);
});

test('$.inValue: second element (index 1)', () => {
  expect([['a', 1], ['b', 2], null].map($.inValue)).toEqual([1, 2, null]);
});

test('$.stretch_: empty', () => {
  expect([{a: 1}, 'vv', 5.5, null].map($.stretch_(0))).toEqual([[], [], [], []]);
});

test('$.stretch_: to iterator', () => {
  const iter = $.stretch_(3, true)(1);
  expect(iter [Symbol.iterator]()).toBe(iter);
  expect(Array.from(iter)).toEqual([1, 1, 1]);
});

test('$.entry: to equal entries', () => {
  expect([{a: 1}, 'vv', 5.5, null].map($.entry)).toEqual([[{a: 1}, {a: 1}], ['vv', 'vv'], [5.5, 5.5], [null, null]]);
});

test('$.times_: true within number of times', () => {
  const t5 = $.times_(5);
  const mapped = [1, 8, 2, 7, 3, 6, 5].map(t5);
  expect(mapped).toEqual([true, true, true, true, true, false, false]);
});

test('$.lag: late in 1 iteration', () => {
  const late = [1, 2, 3, 4, 5].map($.lag);
  expect(late).toEqual([, 1, 2, 3, 4]);
});

test('$.save_, $.load_: save/load value', () => {
  const to = {};
  expect($.save_('a').call(to, 5)).toBe(5);
  expect(to).toEqual({a: 5});
  expect($.load_('a').call(to, 1)).toBe(5);
});

test('$.counter_: range counter: infinite', () => {
  const ct = $.counter_(5);
  expect(ct()).toBe(5);
  expect(ct()).toBe(6);
});

test('$.counter_: range counter: forward', () => {
  const ct = $.counter_(0, 3);
  expect(ct()).toBe(0);
  expect(ct()).toBe(1);
  expect(ct()).toBe(2);
  expect(ct()).toBe(null);
});

test('$.counter_: range counter: backward', () => {
  const ct = $.counter_(3, 0);
  expect(ct()).toBe(3);
  expect(ct()).toBe(2);
  expect(ct()).toBe(1);
  expect(ct()).toBe(null);
});

test('$.relay_: sync func relay group', () => {
  const relay = $.relay_(v => v + 1, v => v * 2);
  expect(relay(4)).toBe(10);
});

test('$.arelay_: async func relay group', async () => {
  const relay = $.arelay_(async v => v + 1, v => v * 2);
  const relayed = relay(4);
  expect(relayed instanceof Promise).toBe(true);
  expect(await relayed).toBe(10);
});

test('$.has_: contained in', () => {
  expect($.has_()('a')).toBe(null);
  expect($.has_({a: 1, b: 2})('a')).toBe(true);
  expect($.has_({a: 1, b: 2})('c')).toBe(false);
  expect($.has_({a: 1, b: 2})('constructor')).toBe(true);
  expect($.has_([, 2])(0)).toBe(false);
  expect($.has_([, 2])(1)).toBe(true);
  expect($.has_(new Set(['a', 'b']))('b')).toBe(true);
  expect($.has_(new Set(['a', 'b']))('c')).toBe(false);
  expect($.has_(new Map([['a', 1], ['b', 2]]))('a')).toBe(true);
});

test('$.hasOwn_: contained in', () => {
  expect($.hasOwn_()('a')).toBe(null);
  expect($.hasOwn_({a: 1, b: 2})('a')).toBe(true);
  expect($.hasOwn_({a: 1, b: 2})('c')).toBe(false);
  expect($.hasOwn_({a: 1, b: 2})('constructor')).toBe(false);
  expect($.hasOwn_([, 2])(0)).toBe(false);
  expect($.hasOwn_([, 2])(1)).toBe(true);
  expect($.hasOwn_(new Set(['a', 'b']))('b')).toBe(true);
  expect($.hasOwn_(new Set(['a', 'b']))('c')).toBe(false);
  expect($.hasOwn_(new Map([['a', 1], ['b', 2]]))('a')).toBe(true);
});
