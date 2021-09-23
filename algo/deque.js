class Deque {
  constructor({quant} = {}) {
    this._quant = Math.abs(quant | 0) || 4;
    this._maxChunk = 1 << this._quant;
    this._first = this._last = {index: 0, chunk: []};
    this._length = 0;
  }

  get length() {
    return this._length;
  }

  pushOne(value) {
    if (this._last.chunk.push(value) >= this._maxChunk) {
      const next = {index: 0, chunk: [], prev: this._last};
      this._last.next = next;
      this._last = next;
    }

    return ++this._length;
  }

  push(...values) {
    if (values.length === 1) return this.pushOne(values[0]);
    values.forEach(value => this.pushOne(value));
    return this._length;
  }

  pop() {
    if (this._last.index >= this._last.chunk.length) {
      if (this._last === this._first) return;
      this._last = this._last.prev;
      this._last.next = null;
    }

    this._length--;
    return this._last.chunk.pop();
  }

  unshiftOne(value) {
    if (!this._first.index) {
      const prev = {index: this._maxChunk, chunk: Array(this._maxChunk), next: this._first};
      this._first.prev = prev;
      this._first = prev;
    }

    this._first.chunk[--this._first.index] = value;
    return ++this._length;
  }

  unshift(...values) {
    if (values.length === 1) return this.unshiftOne(values[0]);
    for (let i = values.length - 1; i >= 0; i--) this.unshiftOne(values[i]);
    return this._length;
  }

  shift() {
    if (this._first.index >= this._first.chunk.length) return;
    const value = this._first.chunk[this._first.index];
    delete this._first.chunk[this._first.index++];
    this._length--;

    if (this._first.index >= this._first.chunk.length) {
      if (this._first.next) {
        this._first = this._first.next;
        this._first.prev = null;
      } else {
        this._first.index = 0;
        this._first.chunk.length = 0;
      }
    }

    return value;
  }

  get first() {
    if (!this._length) return;
    return this._first.chunk[this._first.index];
  }

  get last() {
    if (!this._length) return;
    return this._last.chunk[this._last.chunk.length - 1];
  }

  toArray({reverse} = {}) {
    const chunks = [];

    if (reverse) {
      let chunk = this._last;

      while (chunk) {
        chunks.push(chunk);
        chunk = chunk.prev;
      }
    } else {
      let chunk = this._first;

      while (chunk) {
        chunks.push(chunk);
        chunk = chunk.next;
      }
    }

    const arr = Array.prototype.concat.call(...chunks.map(({index, chunk}) => {
      const slice = chunk.slice(index);
      if (reverse) slice.reverse();
      return slice;
    }));

    return arr;
  }

  *[Symbol.iterator]() {
    let chunk = this._first;

    while (chunk) {
      for (let i = chunk.index; i < chunk.chunk.length; i++) yield chunk.chunk[i];
      chunk = chunk.next;
    }
  }

  *reversed() {
    let chunk = this._last;

    while (chunk) {
      for (let i = chunk.chunk.length - 1; i >= chunk.index; i--) yield chunk.chunk[i];
      chunk = chunk.prev;
    }
  }

  append(iter) {
    for (const item of iter) this.pushOne(item);
    return this._length;
  }

  prepend(iter) {
    for (const item of iter) this.unshiftOne(item);
    return this._length;
  }

  static from(iter, opts = {}) {
    const dq = new this(opts);

    if (opts.reverse) dq.prepend(iter);
    else dq.append(iter);

    return dq;
  }
}

module.exports = Deque;
