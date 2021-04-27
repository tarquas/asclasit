const v8 = require('v8');
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

func_(function jsonParse_(def, reviver) {
  return function _jsonParse(value) {
    try {
      return JSON.parse(value, reviver);
    } catch (err) {
      if (typeof def === 'function') {
        return def.call(this, value, err);
      } else {
        if (err.constructor === SyntaxError) return def;
        throw err;
      }
    }
  };
});

func_($.jsonParse_(), 'jsonParse');

func_(function json_(pad, replacer) {
  return function _json(value) {
    if (value == null) return 'null';
    if (typeof value === 'bigint') value = value.toString();
    return JSON.stringify(value, replacer, pad);
  };
});

func_($.json_(), 'json');

function circular(obj, clone, chain, cache, root, depth, key) {
  if (!obj || typeof(obj) !== 'object') return obj;

  if (cache.has(obj)) {
    if (chain.length) {
      let v = obj;
      const desc = {key, root, clone, cache, chain, depth, cur: v, ctx: this};

      for (const fn of chain) {
        if (typeof fn !== 'function') return fn;
        v = fn.call(this, v, desc);
      }

      return v;
    } else {
      return circular;
    }
  }

  cache.add(obj);

  if (clone !== circular) {
    const obj2 = clone || (obj instanceof Array ? [] : Object.create(null));

    for (const k in obj) {
      let ex = obj2[k];
      if (typeof ex !== 'object') ex = null;
      const wrap = circular(obj[k], ex, chain, cache, root, depth + 1, k);
      if (wrap === circular) delete obj2[k]; else obj2[k] = wrap;
    }

    cache.delete(obj);
    return obj2;
  } else {
    for (const k in obj) {
      const wrap = circular(obj[k], circular, chain, cache, root, depth + 1, k);
      if (wrap === circular) delete obj[k]; else obj[k] = wrap;
    }

    cache.delete(obj);
    return obj;
  }
}

func_(function fixCircular_(...args) {
  return function _fixCircular(value) {
    return circular.call(this, value, circular, args, new Set(), value, 0);
  };
});

func_($.fixCircular_(), 'fixCircular');

func_(function noCircular_(...args) {
  return function _noCircular(value) {
    return circular.call(this, value, null, args, new Set(), value, 0);
  };
});

func_($.noCircular_(), 'noCircular');
func_($.noCircular_(), 'rawClone');

func_(function mergeNoCircular_(to, ...args) {
  return function _noCircular(value) {
    return circular.call(this, value, to, args, new Set(), value, 0);
  };
});

func_(function merge(src, dst, ...funcs) {
  return $.mergeNoCircular_(dst, ...funcs)(src);
});

func_(function clone(value) {
  return v8.deserialize(v8.serialize(value));
});

/*func_(function merge(src, dst) {
  if (!dst) dst = src instanceof Array ? [] : Object.create(null);

  for (const k in src) {
    const v = src[k];

    if (v && typeof v === 'object') {
      let d = dst[k];
      if (!d || typeof d !== 'object') dst[k] = d = v instanceof Array ? [] : Object.create(null);
      merge(d, v);
    } else {
      dst[k] = v;
    }
  }

  return dst;
});*/

module.exports = $;
