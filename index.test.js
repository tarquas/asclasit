const $ = require('./index');
const cr = require('crypto');
const cra = $.promisify(cr, ['createCipheriv']);

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('$: empty: null-prototype object', () => {
  const obj = $();
  expect(Object.getPrototypeOf(obj)).toEqual(null);
  expect(obj).toEqual({});
});

test('$: void iterator: null', () => {
  const wrapped = $(null);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([]);
});

test('$: unknown: other', () => {
  expect(() => $(Symbol())).toThrow('unknown');
});

test('$: make array iterator wrapper', () => {
  const wrapped = $([1, 2, 7], 'x', [8, 3, 2]);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([1, 2, 7, 'x', 8, 3, 2]);
});

test('$: make string characters iterator wrapper', () => {
  const wrapped = $(new String('Hello'));
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual('Hello'.split(''));
});

test('$: make range iterator wrapper', () => {
  const wrapped = $(100, 120, 10);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([100, 110]);
});

test('$: make async iterator wrapper', async () => {
  const wrapped = $('01', async function*() {yield 'a'; yield 'b';} (), ['c', 'd']);
  expect(wrapped instanceof $.AsIt).toBe(true);
  expect(await asItArray(wrapped)).toEqual(['01', 'a', 'b', 'c', 'd']);
});

test('$: make object entries iterator with explicit concat', () => {
  const wrapped = $({a: 1, b: 2, c: 3}, {d: 4}).concat({e: 5});
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped.from())).toEqual([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);
});

test('$: make object entries iterator with implicit concat', () => {
  const wrapped = $({a: 1, b: 2, c: 3}, {d: 4}, [['e', 5]]);
  expect(wrapped instanceof $.Iter).toBe(true);
  expect(Array.from(wrapped.from())).toEqual([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);
});

test('$.enum: create enum', () => {
  const fruits = $.enum('apple', 'pear', 'orange');
  expect(fruits).toEqual({apple: 1, pear: 2, orange: 3, $: {1: 'apple', 2: 'pear', 3: 'orange'}});
});

test('$.enum: create fixed enum', () => {
  const fruits = $.enum({unknown: 1, apple: 10, pear: 20, orange: 30}, 'n/a');

  expect(fruits).toEqual({
    unknown: 1, 'n/a': 2, apple: 10, pear: 20, orange: 30,
    $: {1: 'unknown', 2: 'n/a', 10: 'apple', 20: 'pear', 30: 'orange'}
  });
});

test('Iter_.toAsIt: convert from iter to asIt', async () => {
  const iter = $([1, 2, 3]);
  const asIt = iter.toAsIt();
  expect(asIt instanceof $.AsIt).toBe(true);
  expect(await asItArray(asIt)).toEqual([1, 2, 3]);
});

test('Iter_.pipe: pipe to duplex stream, continue with AsIt', async () => {
  const crypted = await $(5).map($.string).pipe(cr.createCipheriv('bf-cbc', '1234', '12345678')).map($.string_('hex')).reduce();
  expect(crypted).toBe('68422a8db6cd9371');
});

test('Iter_.pipes: partially pipe to duplex stream, continue with AsIt', async () => {
  const cipher = cr.createCipheriv('bf-cbc', '1234', '12345678');
  const out = $();
  $(5).map($.string).pipes(cipher, out);
  await $.finished(out.stream);
  const crypted = await $(5).map($.string).pipe(cipher).map($.string_('hex')).reduce();
  expect(crypted).toBe('7f04e1fa59d4c6b6e13fd4493d9d6c8a');
});

test('$.keys: shortcut to Iter.objectsKeys', () => {
  const keys = $.keys({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(keys)).toEqual(['a', 'b', 'c']);
});

test('$.values: shortcut to Iter.objectsValues', () => {
  const values = $.values({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(values)).toEqual([1, 2, 3]);
});

test('$.entries: shortcut to Iter.objectsEntries', () => {
  const entries = $.entries({a: 1, b: 2}, {c: 3}, null);
  expect(Array.from(entries)).toEqual([['a', 1], ['b', 2], ['c', 3]]);
});

test('$.pure: set null prototype', () => {
  const pure = $.pure({a: 1});
  expect(pure).toEqual({a: 1});
  expect(Object.getPrototypeOf(pure)).toBe(null);
});

test('$.pure: create null prototype', () => {
  const pure = $.pure(null, {a: 1}, {b: 2});
  expect(pure).toEqual({a: 1, b: 2});
  expect(Object.getPrototypeOf(pure)).toBe(null);
});

test('$.promisify: callback to promise', async () => {
  const obj = { id: 'obj', method (arg1, arg2, cb) { cb(null, `${this.id} ${arg1} ${arg2} ok`); } };
  expect(await $.promisify(obj, obj.method, 'a')(1)).toBe('obj a 1 ok');
  expect(await $.promisify(obj, 'method', 'b')(2)).toBe('obj b 2 ok');
  expect(await $.promisify(obj.method).call({id: 'ctx'}, 'c', 3)).toBe('ctx c 3 ok');
  expect(await $.promisify(obj, ['method']).method.call({id: 'ctx'}, 'd', 4)).toBe('ctx d 4 ok');
  expect(await $.promisify(obj, ['method'], false, 'e').method(5)).toBe('undefined e 5 ok');
  expect(await $.promisify(obj, ['method'], true, 'f').method(6)).toBe('obj f 6 ok');
  expect(await $.promisify(obj, ['method'], {id: 'ctx'}, 'g').method(7)).toBe('ctx g 7 ok');
  expect(await $.promisify.call(obj, 'method', {id: 'ctx'}, 'h')(8)).toBe('ctx h 8 ok');
  expect(await $.promisify.call(obj, null, obj.method, 'i')(9)).toBe('obj i 9 ok');
  expect(await $.promisify.call(obj, null, 'method', 'j')(10)).toBe('obj j 10 ok');
  expect(await $.promisify.call(obj, null, ['method'], true, 'k').method(11)).toBe('obj k 11 ok');

  try {
    await $.promisify({});
    expect(true).toBe(false);
  } catch (err) {
    expect(err.constructor).toBe($.NotImplementedError);
  }
});

test('$.finished: stream.finished', async () => {
  const stream = $([1, 2, 3]).stream();
  stream.resume();
  await $.finished(stream);
});

test('Iter_.race: external mapping', async () => {
  const msec = $.AsIt.from([240, 160, 200]);

  const arr = await msec.Iter.from(await msec.toArray()).map(async (msec) => {
    await $.delayMsec(msec);
    return msec;
  }).concat([async () => {
    await $.delayMsec(1);
    return 1;
  }]).map($.mapper).race(2).map($.inValue).toArray();

  expect(arr).toEqual([160, 240, 1, 200]);
});

test('Iter_.race: internal mapping', async () => {
  const msec = $.Iter.from([240, 160, 200, 1]);

  const arr = await msec.race(2, async (msec) => {
    await $.delayMsec(msec);
    return msec;
  }).map($.inValue).toArray();

  expect(arr).toEqual([160, 240, 1, 200]);
});

test('Iter_.map: _mappingFuncs', () => {
  const m = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);
  const s = new Set([1, 3]);
  const o = {1: 'a', 2: 'b', 3: 'c'};
  expect($([1, 2, 3]).map(true).toArray()).toEqual([true, true, true]);
  expect($([1, 2, 3]).map(m).toArray()).toEqual(['a', 'b', 'c']);
  expect($([1, 2, 3]).map(s).toArray()).toEqual([true, false, true]);
  expect($([1, 2, 3]).map(o).toArray()).toEqual(['a', 'b', 'c']);
  expect($([1, 2, 3]).map(2, '1').toArray()).toEqual([1, 2, 3]);
});

test('$: async class', () => {
  expect(() => new $()).toThrow($.AbstractClassError);
});
