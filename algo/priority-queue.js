// original from: https://stackoverflow.com/a/42919752
// credit to: https://stackoverflow.com/users/7256039/gyre
// optimized version.

const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;
const defComparator = (a, b) => a - b;
const negComparator = (sort) => (a, b) => -sort(a, b);

class PriorityQueue {
  constructor({reverse, sort, revSort} = {}) {
    this._heap = [];

    if (reverse) {
      this._comparator = sort || defComparator;
      this._revComparator = revSort || negComparator(this._comparator);
    } else {
      this._revComparator = sort || defComparator;
      this._comparator = revSort || negComparator(this._revComparator);
    }
  }

  get size() {
    return this._heap.length;
  }

  get length() {
    return this._heap.length;
  }

  get isEmpty() {
    return this._heap.length === 0;
  }

  get top() {
    return this._heap[0];
  }

  toArray({reverse, sort, raw, keep} = {}) {
    if (raw) return this._heap;
    let res = this._heap;

    if (keep) res = res.slice();
    else this._heap = [];

    if (sort) return res.sort(sort);
    if (reverse) return res.sort(this._revComparator);
    return res.sort(this._comparator);
  }

  peek() {
    return this._heap[0];
  }

  pushOne(value) {
    this._heap.push(value);
    this._siftUp();
    return this._heap.length;
  }

  push(...values) {
    if (values.length === 1) return this.pushOne(values[0]);

    //for (const value of values) this.pushOne(value);
    //SIC!!! this is faster than above:
    values.forEach(value => this.pushOne(value));

    return this._heap.length;
  }

  pop() {
    if (this._heap.length === 0) return;
    if (this._heap.length === 1) return this._heap.pop();
    const poppedValue = this._heap[0];
    this._heap[0] = this._heap.pop();
    this._siftDown();
    return poppedValue;
  }

  replace(value) {
    const replacedValue = this._heap[0];
    this._heap[0] = value;
    this._siftDown();
    return replacedValue;
  }

  _compareValues(i, j) {
    return this._comparator(i, j) > 0;
  }

  _compare(i, j) {
    return this._comparator(this._heap[i], this._heap[j]) > 0;
  }

  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }

  _siftUp() {
    let node = this._heap.length - 1;

    while (node > 0 && this._compare(node, parent(node))) {
      this._swap(node, node = parent(node));
    }
  }

  _siftDown() {
    let node = 0;

    while (
      (left(node) < this._heap.length && this._compare(left(node), node)) ||
      (right(node) < this._heap.length && this._compare(right(node), node))
    ) {
      if (right(node) < this._heap.length && this._compare(right(node), left(node))) {
        this._swap(node, node = right(node));
      } else {
        this._swap(node, node = left(node));
      }
    }
  }

  *[Symbol.iterator]() {
    while (this._heap.length) yield this.pop();
  }
}

class PriorityQueueLimited extends PriorityQueue {
  constructor(opts = {}) {
    super(opts);
    this._limit = opts.limit || Infinity;
  }

  pushOne(value) {
    if (this._heap.length === 0 || this._heap.length < this._limit) {
      return super.pushOne(value);
    }

    if (!this._compareValues(value, this._heap[0])) {
      this.replace(value);
      return this._heap.length;
    }
  }
}

PriorityQueue.Limited = PriorityQueueLimited;

module.exports = PriorityQueue;
