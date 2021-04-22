const $ = require('./object');

test('get: get value by object walk', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.get(obj, 'a', 'x', 0, 'z');
  expect(value).toBe(obj.a.x[0].z);
});

test('get: missing', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.get(obj, 'a', 't', 0, 'z');
  expect(value).toBe(undefined);
});

test('getDef: get value by object walk', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.getDef(obj, 'a', 'x', 0, 'z', 'undef');
  expect(value).toBe(obj.a.x[0].z);
});

test('getDef: missing', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.getDef(obj, 'a', 't', 0, 'z', 'undef');
  expect(value).toBe('undef');
});

test('getDef: missing in context', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.getDef(obj, 'a', 'x', 0, 'y', 'undef');
  expect(value).toBe('undef');
});

test('getDef: nothing', () => {
  expect($.getDef({})).toBe(undefined);
});

test('getDef: directly from object', () => {
  expect($.getDef({x: null}, 'x', 0)).toBe(null);
});

test('set: set value to object walk', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const prev = $.set(obj, 'a', 'z', 0, 'y', 2n);
  expect(prev).toBe(undefined);
  expect(obj.a.z instanceof Array).toBe(true);
  expect(obj.a.z[0].y).toBe(2n);
});

test('set: replace value in object walk', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const prev = $.set(obj, 'a', 'x', 0, 'z', 2n);
  expect(prev).toEqual({v: 7});
  expect(obj.a.x[0].z).toBe(2n);
});

test('setDef: set value in object walk if not yet set', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const prev = $.setDef(obj, 'a', 'x', 0, 'y', 'value');
  expect(prev).toEqual(undefined);
  expect(obj.a.x[0].y).toBe('value');
});

test('setDef: ignore -- already set', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const prev = $.setDef(obj, 'a', 'x', 0, 'z', 'v', 3n);
  expect(prev).toEqual(7);
  expect(obj.a.x[0].z.v).toBe(7);
});

test('def: default new instance', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const arr = $.def(obj, 'a', 'x', 0, 'z', 't', Array);
  arr.push('1st', '2nd');
  expect(arr.constructor).toBe(Array);
  expect(obj.a.x[0].z.t).toBe(arr);
  expect(arr).toEqual(['1st', '2nd']);
});

test('def: instance -- already exists', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const exists = $.def(obj, 'a', 'x', 0, 'z', 'v', Set);
  expect(exists).toBe(7);
  expect(obj.a.x[0].z.v).toBe(7);
});

test('def: default object', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const obj2 = $.def(obj, 'a', 'x', 0, 'z', 't', null);
  obj2.a = 1;
  expect(Object.getPrototypeOf(obj2)).toBe(null);
  expect(obj.a.x[0].z.t).toBe(obj2);
  expect(obj2).toEqual({a: 1});
});

test('def: default object from prototype', () => {
  const proto = {b: 5};
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const obj2 = $.def(obj, 'a', 'x', 0, 'z', 't', proto);
  obj2.a = 1;
  expect(obj2.constructor).toBe(Object);
  expect(Object.getPrototypeOf(obj2)).toBe(proto);
  expect(obj.a.x[0].z.t).toBe(obj2);
  expect(obj2).toEqual({a: 1});
  expect(obj2.b).toBe(5);
});

test('def: object -- already exists', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const exists = $.def(obj, 'a', 'x', 0, 'z', 'v', null);
  expect(exists).toBe(7);
  expect(obj.a.x[0].z.v).toBe(7);
});

test('def: default value: return context', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.def(obj, 'a', 'x', 0, 'z', 't', 1).t += 3;
  expect(value).toBe(4);
  expect(obj.a.x[0].z.t).toBe(4);
});

test('def: value -- already exists', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.def(obj, 'a', 'x', 0, 'z', 'v', 1).v += 3;
  expect(value).toBe(10);
  expect(obj.a.x[0].z.v).toBe(10);
});

test('defs: default new instance', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const arr = $.defs(obj, 'a', 'x', 0, 'z', 't', Array);
  arr.push('1st', '2nd');
  expect(arr.constructor).toBe(Array);
  expect(obj.a.x[0].z.t).toBe(arr);
  expect(arr).toEqual(['1st', '2nd']);
});

test('defs: instance, key exists -- override', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const over = $.defs(obj, 'a', 'x', 0, 'z', 'v', Set).add(1).add('uniq').add(1);
  expect(over.constructor).toBe(Set);
  expect(obj.a.x[0].z.v).toBe(over);
  expect(Array.from(over)).toEqual([1, 'uniq']);
});

test('defs: instance, key exists -- same type', () => {
  const map = new Map([['x', '7']]);
  const obj = {a: {m: 4, x: [{z: {v: map}}]}};
  const same = $.defs(obj, 'a', 'x', 0, 'z', 'v', Map).set('y', 8).set('z', 'str').set('y', -2);
  expect(same.constructor).toBe(Map);
  expect(same).toBe(map);
  expect(obj.a.x[0].z.v).toBe(map);
  expect(Array.from(same)).toEqual([['x', '7'], ['y', -2], ['z', 'str']]);
});

test('defs: default object', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const obj2 = $.defs(obj, 'a', 'x', 0, 'z', 't', null);
  obj2.a = 1;
  expect(Object.getPrototypeOf(obj2)).toBe(null);
  expect(obj.a.x[0].z.t).toBe(obj2);
  expect(obj2).toEqual({a: 1});
});

test('defs: default object from prototype', () => {
  const proto = {b: 5};
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const obj2 = $.defs(obj, 'a', 'x', 0, 'z', 't', proto);
  obj2.a = 1;
  expect(obj2.constructor).toBe(Object);
  expect(Object.getPrototypeOf(obj2)).toBe(proto);
  expect(obj.a.x[0].z.t).toBe(obj2);
  expect(obj2).toEqual({a: 1});
  expect(obj2.b).toBe(5);
});

test('defs: object, key exists -- override', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const over = $.defs(obj, 'a', 'x', 0, 'z', 'v', null);
  over.xx = 11;
  expect(Object.getPrototypeOf(over)).toBe(null);
  expect(obj.a.x[0].z.v).toBe(over);
  expect(over).toEqual({xx: 11});
});

test('defs: object, key exists -- same type', () => {
  const src = {v: 7};
  const obj = {a: {m: 4, x: [{z: src}]}};
  const over = $.defs(obj, 'a', 'x', 0, 'z', Object.prototype);
  over.xx = 11;
  expect(over).toBe(src);
  expect(Object.getPrototypeOf(over)).toBe(Object.prototype);
  expect(obj.a.x[0].z).toBe(over);
  expect(over).toEqual({v: 7, xx: 11});
});

test('defs: default value: return context', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.defs(obj, 'a', 'x', 0, 'z', 't', 1).t += 3;
  expect(value).toBe(4);
  expect(obj.a.x[0].z.t).toBe(4);
});

test('defs: value, key exists -- same type', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.defs(obj, 'a', 'x', 0, 'z', 'v', 1).v += 3;
  expect(value).toBe(10);
  expect(obj.a.x[0].z.v).toBe(10);
});

test('defs: value, key exists -- override', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const value = $.defs(obj, 'a', 'x', 0, 'z', 2).z += 3;
  expect(value).toBe(5);
  expect(obj.a.x[0].z).toBe(5);
});

test('unset: delete object key in walk', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const prev = $.unset(obj, 'a', 'x', 0, 'z');
  expect(prev).toEqual({v: 7});
  expect('z' in obj.a.x[0]).toBe(false);
});

test('unset: missing context: nothing changed', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const prev = $.unset(obj, 'a', 'y', 0, 'x');
  expect(prev).toEqual(undefined);
  expect(obj).toEqual({a: {m: 4, x: [{z: {v: 7}}]}});
});

test('unset: directly from object', () => {
  const obj = {a: {m: 4, x: [{z: {v: 7}}]}};
  const prev = $.unset(obj, 'a');
  expect(prev).toEqual({m: 4, x: [{z: {v: 7}}]});
  expect(obj).toEqual({});
});

test('invert: swap key and value', () => {
  const inv = [{a: 1, b: 2}, ['k', 'v'], 'a', null, new Map([['K', 'V'], [1, 2]])].map($.invert);
  expect(inv).toEqual([{1: 'a', 2: 'b'}, ['v', 'k'], 'a', null, new Map([['V', 'K'], [2, 1]])]);
});
