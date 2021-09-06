const it = require('./it');
const Design = require('./design');

const symbol = Symbol('$');

function $(...args) {
  if (this !== global && this instanceof $) return $.ctor.call(this, ...args);
  if (!args.length) return Object.create(null);

  const type = guessType(args);
  const res = guessActions[type](...args);
  return res;
};

Object.setPrototypeOf($, null);
$.prototype = Object.create(null);

Design.$classApply($);

$.symbol = symbol;

const func_ = function func_(func, name) {
  $[name || func.name] = func;
};

func_(function makeEnum(...args) {
  const obj = Object.create(null);
  const inv = Object.create(null);
  obj.$ = inv;
  let idx = 1;

  for (const arg of args) {
    if (typeof arg === 'object') {
      $(arg).appendObject(obj).map($.invert).toObject(inv);
    } else {
      while (idx in inv) idx++;
      obj[arg] = idx;
      inv[idx] = arg;
      idx++;
    }
  }

  return obj;
}, 'enum');

const types = $.enum('unknown', 'null', 'number', 'object', 'Iter', 'AsIt');

function guessType(args) {
  let guess = types.unknown;

  for (const arg of args) {
    let type;

    if (arg == null) {
      type = types.null;
    } else if (arg[Symbol.asyncIterator]) {
      type = types.AsIt;
    } else if (arg[Symbol.iterator]) {
      type = types.Iter;
    } else if (typeof arg === 'object' || typeof arg === 'function') {
      type = types.object;
    } else if (typeof arg === 'number') {
      type = types.number;
    } else continue;

    if (type > guess) guess = type;
  }

  return guess;
}

class UnknownArgsError extends Error { message = 'unknown argument set'; };
class NotImplementedError extends Error { message = 'method not yet implemented'; };

const guessActions = {
  [types.unknown]() { throw new UnknownArgsError(); },
  [types.null]() { return $.Iter.void(); },
  [types.number](...args) { return $.Iter.range(...args); },
  [types.object](...args) { return $.Iter.objectsEntries(...args); },
  [types.Iter](...args) { return $.Iter.concat(...args); },
  [types.AsIt](...args) { return $.AsIt.concat(...args); },
};

Object.assign($, {...it, func_, UnknownArgsError, NotImplementedError});
module.exports = $;
