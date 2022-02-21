const $ = require('../base');

const {func_} = $;

func_(function getClass(obj) {
  return Object.getPrototypeOf(obj)?.constructor ?? Object;
});

func_(function echo(value) {
  return value;
});

func_(function _(force) {
  return function _value() {
    return force;
  };
});

func_(async function aecho(value) {
  return value;
});

func_(function nullMap() {
  return null;
}, 'null');

func_(async function anull(value) {
  return null;
});

func_(function ifNull_(func) {
  return function _ifNull(value, ...args) {
    if (value == null) return func.call(this, value, ...args);
    return value;
  };
});

func_(function defNull_(def) {
  return function _defNull(value) {
    if (value == null) return def;
    return value;
  };
});

func_(function trueMap() {
  return true;
}, 'true');

func_(function falseMap() {
  return false;
}, 'false');

func_(function cond_(ifTrue, ifFalse) {
  return function _cond(value) {
    if (value) return ifTrue;
    return ifFalse;
  };
});

$.stop = Symbol('_.stop');
$.pass = Symbol('_.pass');

$.chunkEnds = $.cond_(-1, 0);
$.condSkip = $.cond_(false, $.pass);
$.condTake = $.cond_(true, $.stop);
$.condStop = $.cond_($.stop, true);

func_(function isNullish(value) {
  return value == null;
});

func_(function isNotNullish(value) {
  return value != null;
});

func_(function not(value) {
  return !value;
});

func_(function not_(func) {
  return function _not(...args) {
    const v = func.call(this, ...args);
    return !v;
  };
});

func_(async function anot(value) {
  return !value;
});

func_(function neg(value) {
  return -value;
});

func_(function neg_(func) {
  return function _neg(...args) {
    const v = func.call(this, ...args);
    return -v;
  };
});

func_(async function aneg(value) {
  return -value;
});

func_(function bound() {
  return this;
});

func_(async function abound() {
  return this;
});

func_(function in_(...keys) {
  if (!keys.length) keys = [0];

  if (keys.length === 1) {
    const key = keys[0];

    return function _in(value) {
      if (value == null) return value;
      return value[key];
    };
  }

  return function _in(value) {
    if (value == null) return value;
    let p = value;

    for (const key of keys) {
      if (p == null) break;
      p = p[key];
    }

    return p;
  };
});

func_(function to_(...keys) {
  if (!keys.length) keys = [0];
  const first = keys.shift();

  return function _to(value) {
    if (value == null) return null;
    let p = value;
    let k = first;
    let vk = p;

    for (const key of keys) {
      vk = p[k];
      if (vk == null) p[k] = vk = Number.isInteger(key) ? [] : Object.create(null);
      p = vk;
      k = key;
    }

    return {ctx: p, key: k};
  };
});

func_(function key_(func) {
  return function _key(value) {
    if (value instanceof Array) return value;
    return [func.call(this, value), value];
  }
});

func_(function keyin_(...keys) {
  return $.key_($.in_(...keys));
});

func_($.in_(), 'inKey');
func_($.to_(), 'toKey');

func_(function value_(func) {
  return function _value(value) {
    if (value instanceof Array) return value;
    return [value, func.call(this, value)];
  }
});

func_(function valuein_(...keys) {
  return $.value_($.in_(...keys));
});

func_($.in_(1), 'inValue');
func_($.to_(1), 'toValue');

function* stretch(value, count) {
  for (let i = 0; i < count; i++) {
    yield value;
  }
}

func_(function stretch_(count, iterOut) {
  if (!Number.isInteger(count) || count < 0) count = 2;

  if (iterOut) return function _stretch(value) {
    return stretch(value, count);
  };

  return function _stretch(value) {
    const arr = new Array(count).fill(value);
    return arr;
  };
});

func_($.stretch_(), 'entry');

func_(function counter_(from, to, step) {
  if (to == null) to = Infinity;
  if (!step) step = 1;
  if ((from < to) ^ (step > 0)) step = -step;

  if (step > 0) {
    return function _counter() {
      const v = from;
      if (v >= to) return null;
      from += step;
      return v;
    }
  } else {
    return function _counter() {
      const v = from;
      if (v <= to) return null;
      from += step;
      return v;
    }
  }
});

func_(function times_(n) {
  let i = 0;

  return function _times() {
    return i++ < n;
  };
});

func_(function lag_(n, buf) {
  if (!Number.isInteger(n) || n <= 0) n = 1;
  if (!buf) buf = new $.DQ();

  return function _lag(v) {
    if (buf.push(v) > n) return buf.shift();
  };
});

func_($.lag_(), 'lag');

func_(function window_(n, buf) {
  if (!Number.isInteger(n) || n <= 0) n = 2;
  if (!buf) buf = new $.DQ();

  return function _window(v) {
    if (buf.push(v) > n) buf.shift();
    return buf;
  };
});

func_($.window_(), 'window');

func_(function save_(id) {
  return function _save(value) {
    this[id] = value;
    return value;
  };
});

func_(function load_(id) {
  return function _load() {
    return this[id];
  };
});

func_(function debug_(func, ...pre) {
  return function _debug(value) {
    func.call(this, ...pre, value);
    return value;
  };
});

$.dbglog = $.debug_(console.log);
$.dbglog_ = (...args) => $.debug_(console.log, ...args);

func_(function relay_(...funcs) {
  const desc = {ctx: this};
  $._mappingFuncs(funcs);

  return function _relay(value) {
    let v = value;

    for (const func of funcs) {
      v = func.call(this, v, value, desc);
    }

    return v;
  };
});

func_(function arelay_(...funcs) {
  const desc = {ctx: this};
  $._mappingFuncs(funcs);

  return async function _relay(value) {
    let v = value;

    for (const func of funcs) {
      v = await func.call(this, v, value, desc);
    }

    return v;
  };
});

func_(function _mappingFuncs(funcs, iterOut) {
  const l = funcs.length;

  for (let i = 0; i < l; i++) {
    const a = funcs[i];
    if (a == null) funcs[i] = item => item == null;
    else if (typeof a === 'number') funcs[i] = a < 0 ? $.lag_(-a) : $.stretch_(a, iterOut);
    else if (typeof a === 'boolean') funcs[i] = item => a ? item != null : !item;
    else if (a instanceof Map || a instanceof WeakMap) funcs[i] = item => a.get(item);
    else if (a instanceof Set || a instanceof WeakSet) funcs[i] = item => a.has(item);
    else if (typeof a === 'object') funcs[i] = item => a[item];
    else if (typeof a === 'string' || typeof a === 'symbol') funcs[i] = item => item[a];
  }

  return l;
});

func_(function _predicateFuncs(funcs) {
  const l = funcs.length;

  for (let i = 0; i < l; i++) {
    const a = funcs[i];
    if (typeof a === 'number') funcs[i] = $.times_(a);
  }

  $._mappingFuncs(funcs);
  return l;
});

func_(function cascadeFunc(funcs, v, ...sfx) {
  for (const func of funcs) {
    v = func.call(this, v, ...sfx);
  }

  return v;
});

func_(async function cascadeFuncAsync(funcs, v, ...sfx) {
  for (const func of funcs) {
    v = await func.call(this, v, ...sfx);
  }

  return v;
});

const hasProtos = new Set([Map.prototype, WeakMap.prototype, Set.prototype, WeakSet.prototype]);

func_(function has_(where) {
  if (where == null) return $.null;
  if (hasProtos.has(Object.getPrototypeOf(where))) return value => where.has(value);
  return value => value in where;
});

func_(function hasOwn_(where) {
  if (where == null) return $.null;
  if (hasProtos.has(Object.getPrototypeOf(where))) return value => where.has(value);
  return value => Object.hasOwnProperty.call(where, value);
});

func_(function mapper(item, ...args) {
  if (typeof item === 'function') return item.call(this, ...args);

  if (item instanceof Array && typeof item[1] === 'function') {
    item[1] = item[1].call(this, item[0], ...args);
  }

  return item;
});

module.exports = $;
