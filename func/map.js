const $ = require('../base');

const {func_} = $;

func_(function echo(value) {
  return value;
});

func_(async function aecho(value) {
  return value;
});

func_(function nullMap(value) {
  return null;
}, 'null');

func_(async function anull(value) {
  return null;
});

func_(function not(value) {
  return !value;
});

func_(async function anot(value) {
  return !value;
});

func_(function neg(value) {
  return -value;
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
    return [value, func.call(this, value)];
  }
});

func_(function valuein_(...keys) {
  return $.value_($.in_(...keys));
});

func_($.in_(1), 'inValue');
func_($.to_(1), 'toValue');

func_(function equi_(count) {
  if (!Number.isInteger(count) || count < 0) count = 2;

  return function _equi(value) {
    const arr = new Array(count).fill(value);
    return arr;
  };
});

func_($.equi_(), 'equi');

module.exports = $;
