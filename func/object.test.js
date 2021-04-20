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
