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
  wrap.gen = gen;
  AsIt[name || gen.name] = wrap;
};

const chain_ = function chain_(gen, name) {
  const n = name || gen.name;
  const wrap = AsIt.makeWrap(gen);
  wrap.gen = gen;
  AsIt[n] = wrap;
  AsIt_[n] = AsIt.chainWrap(gen);
};

const value_ = function value_(func, name) {
  const n = name || func.name;
  AsIt[n] = func;
  AsIt_[n] = AsIt.valueWrap(func);
};

AsIt_[Symbol.asyncIterator] = function asyncIterator() {
  const cur = this[wrapped];
  return cur;
};

value_((iter, err) => iter.throw(err), 'throw');
value_((iter, value) => iter.return(value), 'return');

value_(async function next(iter, value) {
  const item = await iter.next(value);
  if (this.constructor !== AsIt) return item;
  if (item.done) this.cur = null; else this.cur++;
  return item;
});

value_(async function read(iter, value) {
  const item = await AsIt.next.call(this, iter, value);
  return item.value;
});

value_(async function ffwd(iter, count, value) {
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

value_(async function affwd(iter, count, value) {
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

Object.assign(AsIt, {wrapped, make_, chain_, value_});

module.exports = AsIt;
