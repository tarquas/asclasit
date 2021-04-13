const wrapped = Symbol('$.Iter.wrap');

const Iter = function(iter) {
  this[wrapped] = iter;
  this.cur = 0;
};

const {prototype: Iter_} = Iter;

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
  const wrapped = new Iter(iter);
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

const make_ = function make_(gen, name) {
  Iter[name || gen.name] = Iter.makeWrap(gen);
};

const chain_ = function chain_(gen, name) {
  Iter_[name || gen.name] = Iter.chainWrap(gen);
};

const value_ = function value_(func, name) {
  Iter_[name || func.name] = Iter.valueWrap(func);
};

Iter_[Symbol.iterator] = function iterator() {
  const cur = this[wrapped];
  return cur;
};

value_((iter, err) => iter.throw(err), 'throw');
value_((iter, value) => iter.return(value), 'return');

function next(iter, value) {
  const item = iter.next(value);
  if (item.done) this.cur = null; else this.cur++;
  return item;
};

value_(next);

value_(function read(iter, value) {
  const item = next.call(this, iter, value);
  return item.value;
});

value_(function skip(iter, count, value) {
  let last;

  while (count--) {
    const item = iter.next(value);
    last = item.value;
    if (item.done) { this.cur = null; break; }
    this.cur++;
  }

  return last;
});

Object.assign(Iter, {wrapped, make_, chain_, value_});

module.exports = Iter;
