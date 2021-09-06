const $ = require('./math'); 

test('$.inc: inc by 1', () => {
  expect([1, 2, 3, 4, 5].map($.inc)).toEqual([2, 3, 4, 5, 6]);
});

test('$.add_: add const', () => {
  expect([1, 2, 3, 4, 5].map($.add_(-1))).toEqual([0, 1, 2, 3, 4]);
});

test('$.add_: append strings', () => {
  expect([1, 2, 3, 4, 5].map($.add_('a'))).toEqual(['1a', '2a', '3a', '4a', '5a']);
});

test('$.pfx_: prepend strings', () => {
  expect([1, 2, 3, 4, 5].map($.pfx_('a'))).toEqual(['a1', 'a2', 'a3', 'a4', 'a5']);
});

test('$.pfx_: prepend strings with default _', () => {
  expect([1, 2, 3, 4, 5].map($.pfx_())).toEqual(['_1', '_2', '_3', '_4', '_5']);
});

test('$.dup: mul by 2', () => {
  expect([1, 2, 3, 4, 5].map($.dup)).toEqual([2, 4, 6, 8, 10]);
});

test('$.mul_: multiply by const', () => {
  expect([1, 2, 3, 4, 5].map($.mul_(-1))).toEqual([-1, -2, -3, -4, -5]);
});

test('$.sqr: to square', () => {
  expect([1, 2, 3, 4, 5].map($.sqr)).toEqual([1, 4, 9, 16, 25]);
});

test('$.sqrt: square root', () => {
  expect([1, 4, 9, 16, 25].map($.sqrt)).toEqual([1, 2, 3, 4, 5]);
});

test('$.rcpr: reciprocal', () => {
  expect([1, 2, 3, 4, 5].map($.rcpr)).toEqual([1, 1/2, 1/3, 1/4, 1/5]);
});

test('$.rcpr_: reciprocal from nominator', () => {
  expect([1, 2, 3, 4, 5].map($.rcpr_(2))).toEqual([2, 1, 2/3, 1/2, 2/5]);
});

test('$.rsqrt: reciprocal square root', () => {
  expect([1, 2, 3, 4, 5].map($.rsqrt).map(n => n.toFixed(2))).toEqual(['1.00', '0.71', '0.58', '0.50', '0.45']);
});

test('$.pow_: to const power', () => {
  expect([1, 2, 3, 4, 5].map($.pow_(3))).toEqual([1, 8, 27, 64, 125]);
});

test('$.exp: power of euler base', () => {
  expect([1, 2].map($.exp)).toEqual([Math.exp(1), Math.exp(2)]);
});

test('$.exp_: power of const base', () => {
  expect([1, 2, 3, 4, 5].map($.exp_(2))).toEqual([2, 4, 8, 16, 32]);
});

test('$.ln: natural logarithm', () => {
  expect([Math.exp(1), Math.exp(2)].map($.ln)).toEqual([1, 2]);
});

test('$.log_: logarithm of base', () => {
  expect([1, 2, 4, 8, 16].map($.log_(2))).toEqual([0, 1, 2, 3, 4]);
});

test('$.eq_: equal', () => {
  expect($.eq_(5)(5)).toBe(true);
  expect($.eq_(3)(6)).toBe(false);
});

test('$.lt_: less than', () => {
  expect($.lt_(5)(5)).toBe(false);
  expect($.lt_(5)(6)).toBe(false);
  expect($.lt_(6)(5)).toBe(true);
});

test('$.lte_: less than', () => {
  expect($.lte_(5)(5)).toBe(true);
  expect($.lte_(5)(6)).toBe(false);
  expect($.lte_(6)(5)).toBe(true);
});

test('$.gt_: greater than', () => {
  expect($.gt_(0)(0)).toBe(false);
  expect($.gt_(6)(4)).toBe(false);
  expect($.gt_(4)(5)).toBe(true);
});

test('$.gte_: greater than', () => {
  expect($.gte_(0)(0)).toBe(true);
  expect($.gte_(6)(4)).toBe(false);
  expect($.gte_(4)(5)).toBe(true);
});
