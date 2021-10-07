const $ = require('./map');

const {func_} = $;

func_(function sort(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
});

func_(function numSort(a, b) {
  return a - b;
});

func_(function safeNumSort(a, b) {
  return (+a || 0) - (+b || 0);
});

func_(function sortField_(key) {
  if (key == null) key = 0;

  return function _sort(A, B) {
    const a = A[key];
    const b = B[key];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };
});

func_($.sortField_(), 'sortKey');

const refTypes = new Set(['object', 'function']);

func_(function sort_(...funcs) {
  const func = funcs[0];
  if (funcs.length === 1 && (typeof func === 'string' || typeof func === 'symbol')) return $.sortField_(func);
  const sort = $.relay_.apply(this, funcs);

  return function _sort(A, B) {
    const a = sort(A);
    const b = sort(B);
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };
});

func_(function lastElem(arr, back = 0) {
  if (arr instanceof Array) return arr[arr.length - back - 1];
  return null;
});

module.exports = $;
