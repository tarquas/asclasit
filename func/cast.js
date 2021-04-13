const $ = require('../base');

const {func_} = $;

func_(function number(value) {
  return Number(value);
});

func_(function numstr(value) {
  return Number(value).toPrecision();
});

func_(function numfix_(fix) {
  if (fix == null) return $.numstr;
  if (fix < 0) fix = -fix;

  return function _numfix(value) {
    return Number(value).toFixed(fix);
  };
});

func_(function numprec_(pc) {
  if (!pc) return $.numstr;
  if (pc < 0) pc = -pc;

  return function _numprec(value) {
    return Number(value).toPrecision(pc);
  };
});

func_(function numexp_(pc) {
  if (!pc) return $.numstr;
  if (pc < 0) pc = -pc;

  return function _numexp(value) {
    return Number(value).toExponential(pc);
  };
});

func_(function int_(radix) {
  if (!radix) radix = 10;

  return function _int(value) {
    if (!value) return 0;
    if (typeof value === 'string') return parseInt(value, radix);

    if (value[Symbol.iterator]) {
      value = value[Symbol.iterator]().next().value;
      if (!value) return 0;
      if (typeof value === 'string') return parseInt(value, radix);
    }

    if (typeof value === 'number') return Math.floor(value);
    if (typeof value === 'bigint') return Number(value);
    return 1;
  };
});

func_($.int_(), 'int');

func_(function int32(value) {
  if (typeof value === 'bigint') return Number(value) | 0;
  return value | 0;
});

func_(function bigint(value) {
  if (value == null) return 0n;
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string') return BigInt(value);

  if (value[Symbol.iterator]) {
    value = value[Symbol.iterator]().next().value;
    if (typeof value === 'string') return BigInt(value);
    if (value == null) return 0n;
  }

  if (typeof value === 'number') return Number.isFinite(value) ? BigInt(Math.floor(value)) : 0n;
  try { return BigInt(value); } catch (err) { return 0n; }
});

func_(function string_(radix) {
  if (!radix) radix = 10;

  return function _string(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;

    if (value.toString === Object.prototype.toString || value.toString === Array.prototype.toString) {
      return JSON.stringify(value);
    }

    return value.toString(radix);
  };
});

func_($.string_(), 'string');

func_(function json_(pad, replacer) {
  return function _json(value) {
    if (value == null) return 'null';
    if (typeof value === 'bigint') value = value.toString();
    return JSON.stringify(value, replacer, pad);
  };
});

func_($.json_(), 'json');

module.exports = $;
