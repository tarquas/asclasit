const $ = require('../base');

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

func_(function sort_(key) {
  if (key == null) key = 0;

  return function _sort(A, B) {
    const a = A[key];
    const b = B[key];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };
});

func_($.sort_(), 'sortKey');

module.exports = $;
