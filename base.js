function makeEnum(...args) {  //TODO: >> Obj
  const obj = Object.create(null);
  let idx = 0;
  for (const arg of args) obj[arg] = idx++;
  return obj;
}

const types = makeEnum('unknown', 'number', 'object', 'Iter', 'AsIt');

function guessType(args) {
  let guess = types.unknown;

  for (const arg of args) {
    if (arg == null) continue;
    let type;

    if (arg[Symbol.asyncIterator]) {
      type = types.AsIt;
    } else if (arg[Symbol.iterator]) {
      type = types.Iter;
    } else if (typeof arg === 'object') {
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
  [types.number](...args) { return $.Iter.range(...args); },
  [types.object](...args) { return $.Iter.entries(...args); },
  [types.Iter](...args) { return $.Iter.concat(...args); },
  [types.AsIt](...args) { return $.AsIt.concat(...args); },
};

const $ = function $(...args) {
  if (this instanceof $) throw new NotImplementedError();

  const type = guessType(args);
  const res = guessActions[type](...args);
  return res;
};

const func_ = function func_(func, name) {
  $[name || func.name] = func;
};

Object.assign($, {func_, UnknownArgsError, NotImplementedError});
module.exports = $;
