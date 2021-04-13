const $ = require('../base');

const {func_} = $;

func_(function add_(incr) {
  if (incr == null) incr = 1;

  return function _add(value) {
    return value + incr;
  };
});

func_($.add_(), 'inc');

func_(function pfx_(pfx) {
  if (pfx == null) pfx = '_';

  return function _pfx(value) {
    return pfx + value;
  };
});

func_(function mul_(factor) {
  if (factor == null) return function dup(value) {
    return value + value;
  }

  return function _mul(value) {
    return value * factor;
  }
});

func_($.mul_(), 'dup');

func_(function sqr(value) {
  return value * value;
});

func_(function sqrt(value) {
  return Math.sqrt(value);
});

func_(function rcpr_(nom) {
  if (nom == null) nom = 1;

  return function _rcpr(value) {
    return nom / value;
  };
});

func_($.rcpr_(), 'rcpr');

func_(function pow_(power) {
  if (power == null) power = -0.5;

  return function _pow(value) {
    return value ** power;
  };
});

func_($.pow_(), 'rsqrt');

func_(function exp_(base) {
  if (base == null) return function _exp(value) {
    return Math.exp(value);
  };

  return function _exp(value) {
    return base ** value;
  };
});

func_($.exp_(), 'exp');

func_(function log_(base) {
  if (base == null) return function _log(value) {
    return Math.log(value);
  };

  return function _log(value) {
    return Math.log(value) / Math.log(base);
  };
});

func_($.log_(), 'ln');

module.exports = $;
