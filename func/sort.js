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

func_(function insSort(arr, item, func, maxLength) {
  let min = 0;
  let max = arr.length;
  let index = Math.floor((min + max) / 2);

  while (max > min) {
    if (func.call(this, item, arr[index]) < 0) {
      max = index;
    } else {
      min = index + 1;
    }

    index = Math.floor((min + max) / 2);
  }

  if (index >= maxLength) return null;

  if (index === arr.length) {
    arr.push(item);
  } else {
    if (!index) arr.unshift(item);
    else arr.splice(index, 0, item);
    if (arr.length > maxLength) arr.pop();
  }

  return index;
});

func_(function lastElem(arr, back = 0) {
  if (arr instanceof Array) return arr[arr.length - back - 1];
  return null;
});

module.exports = $;
