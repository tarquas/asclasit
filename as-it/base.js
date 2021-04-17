const wrapped = Symbol('$.AsIt.wrap');

const AsIt = function(iter) {
  this[wrapped] = iter;
  this.cur = 0;
};

const {prototype: AsIt_} = AsIt;

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

const make_ = function make_(gen, name) {
  const wrap = AsIt.makeWrap(gen);
  wrap.raw = gen;
  AsIt[name || gen.name] = wrap;
};

const chain_ = function chain_(gen, name) {
  const n = name || gen.name;
  AsIt[n] = gen;
  AsIt_[n] = AsIt.chainWrap(gen);
};

const value_ = function value_(func, name) {
  const n = name || func.name;
  AsIt[n] = func;
  AsIt_[n] = AsIt.valueWrap(func);
};

const short_ = function short_(func, name) {
  const n = name || func.name;
  AsIt_[n] = func;
};

AsIt_[Symbol.asyncIterator] = function asyncIterator() {
  const cur = this[wrapped];
  return cur;
};

value_((iter, err) => iter.throw(err), 'throw');
value_((iter, value) => iter.return(value), 'return');

async function next(iter, value) {
  const item = await iter.next(value);
  if (item.done) this.cur = null; else this.cur++;
  return item;
};

value_(next);

value_(async function read(iter, value) {
  const item = await next.call(this, iter, value);
  return item.value;
});

value_(async function skip(iter, count, value) {
  let last;

  while (count--) {
    const item = await iter.next(value);
    last = item.value;
    if (item.done) { this.cur = null; break; }
    this.cur++;
  }

  return last;
});

Object.assign(AsIt, {wrapped, make_, chain_, value_, short_});

module.exports = AsIt;
