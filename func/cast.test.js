const $ = require('./cast');

test('$.number: convert to Number', () => {
  const mapped = [undefined, true, 3, 5n, '87', 9.1, {a: 5}, [43], Infinity].map($.number);
  expect(mapped).toEqual([NaN, 1, 3, 5, 87, 9.1, NaN, 43, Infinity]);
});

test('$.numfix_: to string', () => {
  const mapped = [[21.435], '56.127', 12.9222].map($.numfix_());
  expect(mapped).toEqual(['21.435', '56.127', '12.9222']);
});

test('$.numfix_: to fixed frac digits', () => {
  const mapped = [[21.435], '56.127', 12.9222].map($.numfix_(2));
  expect(mapped).toEqual(['21.43', '56.13', '12.92']);
});

test('$.numfix_: to fixed frac digits (neg same)', () => {
  const mapped = [[21.435], '56.127', 12.9222].map($.numfix_(-2));
  expect(mapped).toEqual(['21.43', '56.13', '12.92']);
});

test('$.numprec_: to string', () => {
  const mapped = [[21.435], '56.127', 12.9222].map($.numprec_());
  expect(mapped).toEqual(['21.435', '56.127', '12.9222']);
});

test('$.numprec_: to precision digits', () => {
  const mapped = [[1.435], '56.127', 129.222].map($.numprec_(2));
  expect(mapped).toEqual(['1.4', '56', '1.3e+2']);
});

test('$.numprec_: to precision digits (neg same)', () => {
  const mapped = [[1.435], '56.127', 129.222].map($.numprec_(-2));
  expect(mapped).toEqual(['1.4', '56', '1.3e+2']);
});

test('$.numexp_: to string', () => {
  const mapped = [[21.435], '56.127', 12.9222].map($.numexp_());
  expect(mapped).toEqual(['21.435', '56.127', '12.9222']);
});

test('$.numexp_: to precision digits', () => {
  const mapped = [[1.435], '56.127', 129.222].map($.numexp_(2));
  expect(mapped).toEqual(['1.44e+0', '5.61e+1', '1.29e+2']);
});

test('$.numexp_: to precision digits (neg same)', () => {
  const mapped = [[1.435], '56.127', 129.222].map($.numexp_(-2));
  expect(mapped).toEqual(['1.44e+0', '5.61e+1', '1.29e+2']);
});

test('$.int: convert to int', () => {
  const mapped = [undefined, true, 3, 5n, '87', 9.1, {a: 5}, [43], [], NaN, Infinity].map($.int);
  expect(mapped).toEqual([0, 1, 3, 5, 87, 9, 1, 43, 0, 0, Infinity]);
});

test('$.int: convert to int, strings with radix 16', () => {
  const mapped = [undefined, true, 3, 5n, '87', 9.1, {a: 5}, [43], ['a'], Infinity].map($.int_(16));
  expect(mapped).toEqual([0, 1, 3, 5, 135, 9, 1, 43, 10, Infinity]);
});

test('$.int32: convert to int32', () => {
  const mapped = [undefined, true, 3, 5n, '87', 9.1, {a: 5}, [43], 1e10, NaN, Infinity].map($.int32);
  expect(mapped).toEqual([0, 1, 3, 5, 87, 9, 0, 43, 1410065408, 0, 0]);
});

test('$.bigint: convert to BigInt', () => {
  const mapped = [undefined, true, 3, 5n, '87', 9.1, {a: 5}, [43], [], ['0xa'], 1e10, Infinity].map($.bigint);
  expect(mapped).toEqual([0n, 1n, 3n, 5n, 87n, 9n, 0n, 43n, 0n, 10n, 10n ** 10n, 0n]);
});

test('$.string: convert to string', () => {
  const mapped = [undefined, true, 3, 5n, '87', 9.1, {a: 5}, [43], 1e10, NaN, Infinity].map($.string);
  expect(mapped).toEqual(['', 'true', '3', '5', '87', '9.1', '{"a":5}', '[43]', '10000000000', 'NaN', 'Infinity']);
});

test('$.string_: convert to string, numbers with radix 8', () => {
  const mapped = [undefined, true, 3, 5n, '87', 9, {a: 5}, [43], 1e10, NaN, Infinity].map($.string_(8));
  expect(mapped).toEqual(['', 'true', '3', '5', '87', '11', '{"a":5}', '[43]', '112402762000', 'NaN', 'Infinity']);
});

test('$.jsonParse: type error', () => {
  expect(() => $.jsonParse(Symbol())).toThrow(TypeError);
});

test('$.jsonParse: parse json strings with representing bad syntax with undefined', () => {
  const mapped = ['1', '"1"', 'null', 'bad', '{"a": 4}', '[1, "2", {"3": "4"}]'].map($.jsonParse);
  expect(mapped).toEqual([1, '1', null, , {a: 4}, [1, '2', {3: '4'}]]);
});

test('$.jsonParse_: parse json strings with default to src string', () => {
  const mapped = ['1', '"1"', 'null', 'bad', '{"a": 4}', '[1, "2", {"3": "4"}]'].map($.jsonParse_(v => v));
  expect(mapped).toEqual([1, '1', null, 'bad', {a: 4}, [1, '2', {3: '4'}]]);
});

test('$.json: convert to json', () => {
  const mapped = [undefined, true, 3, 5n, '87', 9.1, {a: 5}, [43], 1e10, NaN, Infinity].map($.json);
  expect(mapped).toEqual(['null', 'true', '3', '"5"', '"87"', '9.1', '{"a":5}', '[43]', '10000000000', 'null', 'null']);
});

test('$.fixCircular: discard circular refs in existing object', () => {
  const cref = {a: [{b: {c: 1}}]};
  cref.a[0].b.d = cref;
  const orig = {x: {y: {z: cref}}};
  const fixed = $.fixCircular(orig);
  expect(orig === fixed).toBe(true);
  expect(fixed).toEqual({x: {y: {z: {a: [{b: {c: 1}}]}}}});
});

test('$.fixCircular: replace circular refs in existing object with string', () => {
  const cref = {a: [{b: {c: 1}}]};
  cref.a[0].b.d = cref;
  const orig = {x: {y: {z: cref}}};
  const fixed = $.fixCircular_('[Circular]')(orig);
  expect(orig === fixed).toBe(true);
  expect(fixed).toEqual({x: {y: {z: {a: [{b: {c: 1, d: '[Circular]'}}]}}}});
});

test('$.noCircular: clone to object without circular refs', () => {
  const cref = {a: [{b: {c: 1}}]};
  cref.a[0].b.d = cref;
  const orig = {x: {y: {z: cref}}};
  const fixed = $.noCircular(orig);
  expect(orig !== fixed).toBe(true);
  expect(fixed).toEqual({x: {y: {z: {a: [{b: {c: 1}}]}}}});
});

test('$.noCircular: clone to object with circular refs replaced with its functional', () => {
  const cref = {a: [{b: {c: 1}}]};
  cref.a[0].b.d = cref;
  const orig = {x: {y: {z: cref}}};
  const fixed = $.noCircular_(ref => ref.a[0].b.c)(orig);
  expect(orig !== fixed).toBe(true);
  expect(fixed).toEqual({x: {y: {z: {a: [{b: {c: 1, d: 1}}]}}}});
});

test('$.clone: native clone', () => {
  const src = [undefined, true, 3, 5n, '87', 9.1, {a: 5}, [43, {zzz: 'yes'}], 1e10, NaN, Infinity, new Date('2010-01-01')];
  const mapped = src.map($.clone);
  expect(mapped).toEqual(src);
  expect(mapped[6] !== src[6]).toBe(true);
  expect(mapped[7] !== src[7]).toBe(true);
  expect(mapped[7][1] !== src[7][1]).toBe(true);
  expect(mapped[11] !== src[11]).toBe(true);
});

test('$.clone: circular', () => {
  const cref = {a: [{b: {c: 1}}]};
  cref.a[0].b.d = cref;
  const orig = {x: {y: {z: cref}}};
  const cloned = $.clone(orig);
  expect(cloned).toEqual(orig);
  expect(cloned !== orig).toBe(true);
  expect(cloned.x.y.z.a[0].b.d !== orig.x.y.z.a[0].b.d).toBe(true);
  expect(cloned.x.y.z.a[0].b.d.a === cloned.x.y.z.a).toBe(true);
});

test('$.merge: deep', () => {
  const src = {a: {b: [{c: 1}, {d: 2}]}, x: {y: ['a', null, 9.1]}};
  const dst = {x: {z: ['c', 5]}};
  $.merge(src, dst);
  expect(dst).toEqual({a: {b: [{c: 1}, {d: 2}]}, x: {z: ['c', 5], y: ['a', null, 9.1]}});
});

test('$.merge: circular', () => {
  const src = {a: {b: [{c: 1}, {d: 2}]}, x: {y: ['a', null, 9.1]}};
  src.x.z = src;
  const dst = {x: {z: ['c', 5]}};
  $.merge(src, dst, () => 'circular');
  expect(dst).toEqual({a: {b: [{c: 1}, {d: 2}]}, x: {z: 'circular', y: ['a', null, 9.1]}});
});
