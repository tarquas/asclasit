const Design = require('../design');

const wrapped = Symbol('$.AsIt.wrapped');

const AsIt = function(iter) {
  if (!iter) throw new TypeError('not iterable');
  if (!iter[Symbol.iterator] && !iter[Symbol.asyncIterator]) throw new TypeError('not iterable');
  this[wrapped] = iter;

  Object.defineProperties(this, {
    $: {value: this.constructor, configurable: true},
    $_: {value: this.constructor.prototype, configurable: true},
    cur: {value: 0, writable: true},
  });

  this[wrapped] = iter;
  Design.$itApply.call(this.constructor);
};

AsIt.wrapped = wrapped;

const {prototype: AsIt_} = AsIt;

Object.defineProperties(AsIt, {
  $: { get() { return this; } },
  $_: { get() { return this.prototype; } },
});

AsIt.getGen = function getGen(itrb, strOk, ...args) {
  if (typeof itrb === 'function') return itrb.bind(this, ...args);
  if (!strOk && typeof itrb !== 'object') return null;

  const agen = itrb[Symbol.asyncIterator];
  if (typeof agen === 'function') return agen.bind(itrb);

  const gen = itrb[Symbol.iterator];
  if (typeof gen === 'function') return gen.bind(itrb);

  return null;
};

AsIt.getIter = function getIter(itrb, strOk, ...args) {
  if (typeof itrb === 'function') itrb = itrb.call(this, ...args);
  if (!strOk && typeof itrb !== 'object') return null;

  const agen = itrb[Symbol.asyncIterator];
  if (typeof agen === 'function') return agen.call(itrb);

  const gen = itrb[Symbol.iterator];
  if (typeof gen === 'function') return gen.call(itrb);

  return null;
};

AsIt.makeWrap = (gen) => function makeWrap(...args) {
  const iter = gen.call(this, ...args);
  const wrapped = new AsIt(iter);
  return wrapped;
};

AsIt.chainWrap = (gen) => function chainWrap(...args) {
  const prev = this[wrapped];
  const iter = gen.call(this, prev, ...args);
  this[wrapped] = iter;
  this.cur = 0;
  return this;
};

AsIt.valueWrap = (func) => function valueWrap(...args) {
  const prev = this[wrapped];
  const res = func.call(this, prev, ...args);
  return res;
};

AsIt.make_ = AsIt_.make_ = function make_(gen, name) {
  const wrap = this.$.makeWrap(gen);
  wrap.gen = gen;
  Object.defineProperty(this.$, name || gen.name, {value: wrap});
  return this;
};

AsIt.chain_ = AsIt_.chain_ = function chain_(gen, name) {
  const n = name || gen.name;
  const wrap = this.$.makeWrap(gen);
  wrap.gen = gen;
  Object.defineProperty(this.$, n, {value: wrap});
  this.$_[n] = this.$.chainWrap(gen);
  return this;
};

AsIt.value_ = AsIt_.value_ = function value_(func, name) {
  const n = name || func.name;
  Object.defineProperty(this.$, n, {value: func});
  this.$_[n] = this.$.valueWrap(func);
  return this;
};

AsIt_.$applied = true;

AsIt_[Symbol.asyncIterator] = function asyncIterator() {
  const cur = this[wrapped];
  return cur;
};

AsIt.value_((iter, err) => { if (iter.throw) return iter.throw(err); }, 'throw');
AsIt.value_((iter, value) => { if (iter.return) return iter.return(value); }, 'return');

AsIt.value_(async function next(iter, value) {
  const item = await iter.next(value);
  if (!(this instanceof AsIt)) return item;
  if (item.done) this.cur = null; else this.cur++;
  return item;
});

AsIt.value_(async function read(iter, value) {
  const item = await this.$.next.call(this, iter, value);
  return item.value;
});

AsIt.value_(async function ffwd(iter, count, value) {
  let last;
  let n = count;

  while (n--) {
    last = await iter.next(value);
    if (last.done) break;
  }

  if (this.constructor === AsIt) {
    if (last.done) this.cur = null;
    else this.cur += count;
  }

  return last;
});

AsIt.value_(async function affwd(iter, count, value) {
  const proms = [];
  let n = count;

  while (n--) {
    proms.push(iter.next(value));
  }

  const nexts = await Promise.all(proms);
  const last = nexts[nexts.length - 1];

  if (this.constructor === AsIt) {
    if (last.done) this.cur = null;
    else this.cur += count;
  }

  return last;
});

AsIt.chain_(async function* save(iter, id) {
  for await (const item of iter) {
    this[id] = item;
    yield item;
  }
});

AsIt.chain_(async function* load(iter, id) {
  for await (const item of iter) {
    yield this[id];
  }
});

module.exports = AsIt;
