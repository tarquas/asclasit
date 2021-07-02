const Design = require('../design');

const wrapped = Symbol('$.Iter.wrapped');

const Iter = function(iter) {
  if (!iter || !iter[Symbol.iterator]) throw new TypeError('not iterable');
  this[wrapped] = iter;

  Object.defineProperties(this, {
    cur: { value: 0, writable: true },
    $: {value: this.constructor, configurable: true},
    $_: {value: this.constructor.prototype, configurable: true},
  });

  this[wrapped] = iter;
  Design.$itApply.call(this.constructor);
};

Iter.wrapped = wrapped;

const {prototype: Iter_} = Iter;

Object.defineProperties(Iter, {
  $: { get() { return this; } },
  $_: { get() { return this.prototype; } },
});

Iter.getGen = function getGen(itrb, strOk, ...args) {
  if (typeof itrb === 'function') return itrb.bind(this, ...args);
  if (!strOk && typeof itrb !== 'object') return null;

  const gen = itrb[Symbol.iterator];
  if (typeof gen === 'function') return gen.bind(itrb);

  return null;
};

Iter.getIter = function getIter(itrb, strOk, ...args) {
  if (typeof itrb === 'function') itrb = itrb.call(this, ...args);
  if (!strOk && typeof itrb !== 'object') return null;

  const gen = itrb[Symbol.iterator];
  if (typeof gen === 'function') return gen.call(itrb);

  return null;
};

Iter.makeWrap = (gen) => function makeWrap(...args) {
  const iter = gen.call(this, ...args);
  const wrapped = new this.$(iter);
  return wrapped;
};

Iter.chainWrap = (gen) => function chainWrap(...args) {
  const prev = this[wrapped];
  const iter = gen.call(this, prev, ...args);
  this[wrapped] = iter;
  this.cur = 0;
  return this;
};

Iter.valueWrap = (func) => function valueWrap(...args) {
  const prev = this[wrapped];
  const res = func.call(this, prev, ...args);
  return res;
};

Iter.make_ = Iter_.make_ = function make_(gen, name) {
  const wrap = this.$.makeWrap(gen);
  wrap.gen = gen;
  Object.defineProperty(this.$, name || gen.name, {value: wrap});
  return this;
};

Iter.chain_ = Iter_.chain_ = function chain_(gen, name) {
  const n = name || gen.name;
  const wrap = this.$.makeWrap(gen);
  wrap.gen = gen;
  Object.defineProperty(this.$, n, {value: wrap});
  this.$_[n] = this.$.chainWrap(gen);
  return this;
};

Iter.value_ = Iter_.value_ = function value_(func, name) {
  const n = name || func.name;
  Object.defineProperty(this.$, n, {value: func});
  this.$_[n] = this.$.valueWrap(func);
  return this;
};

Iter_.$applied = true;

Iter_[Symbol.iterator] = function iterator() {
  const cur = this[wrapped];
  return cur;
};

Iter.value_((iter, err) => { if (iter.throw) return iter.throw(err); }, 'throw');
Iter.value_((iter, value) => { if (iter.return) return iter.return(value); }, 'return');

Iter.value_(function next(iter, value) {
  const item = iter.next(value);
  if (!(this instanceof Iter)) return item;
  if (item.done) this.cur = null; else this.cur++;
  return item;
});

Iter.value_(function read(iter, value) {
  const item = this.$.next.call(this, iter, value);
  return item.value;
});

Iter.value_(function ffwd(iter, count, value) {
  let last;
  let n = count;

  while (n--) {
    last = iter.next(value);
    if (last.done) break;
  }

  if (this instanceof Iter) {
    if (last.done) this.cur = null;
    else this.cur += count;
  }

  return last;
});

Iter.chain_(function* save(iter, id) {
  for (const item of iter) {
    this[id] = item;
    yield item;
  }
});

Iter.chain_(function* load(iter, id) {
  for (const item of iter) {
    yield this[id];
  }
});

module.exports = Iter;
