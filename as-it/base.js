const wrapped = Symbol('$.AsIt.wrap');

const AsIt = function(iter) {
  this[wrapped] = iter;
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
  return this;
};

AsIt.valueWrap = (func) => function valueWrap(...args) {
  const prev = this[wrapped];
  const res = func.call(this, prev, ...args);
  return res;
};

const make_ = function make_(gen, name) {
  AsIt[name || gen.name] = AsIt.makeWrap(gen);
};

const chain_ = function chain_(gen, name) {
  AsIt_[name || gen.name] = AsIt.chainWrap(gen);
};

const value_ = function value_(func, name) {
  AsIt_[name || func.name] = AsIt.valueWrap(func);
};

AsIt_[Symbol.asyncIterator] = function asyncIterator() {
  const cur = this[wrapped];
  return cur;
};

value_((iter, value) => iter.next(value), 'next');
value_((iter, err) => iter.throw(err), 'throw');
value_((iter, value) => iter.return(value), 'return');

Object.assign(AsIt, {wrapped, make_, chain_, value_});

module.exports = AsIt;
