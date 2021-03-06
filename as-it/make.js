const AsIt = require('./object');

AsIt.chain_(async function* voidIter() { }, 'void');

function bound() { return this; }

AsIt.chain_(async function* shim(iter) {
  if (!iter[Symbol.asyncIterator] && !iter[Symbol.iterator]) {
    iter = Object.create(iter);
    iter[Symbol.asyncIterator] = bound;
  }

  for await (const item of iter) yield item;
});

AsIt.chain_(async function* from(arg, strOk) {
  const iter = AsIt.getIter(arg, strOk);

  if (iter) yield* iter;
  else if (typeof arg === 'object') yield* AsIt.objectEntries.gen(arg);
  else yield arg;
});

AsIt.chain_(async function* concat(...args) {
  for await (const arg of args) {
    yield* AsIt.from.gen.call(this, arg);
  }
});

AsIt.chain_(AsIt.concat.gen, 'append');

AsIt.chain_(async function* prepend(...args) {
  for (let i = args.length - 1; i >= 0; i--) {
    yield* AsIt.from.gen.call(this, args[i]);
  }
});

AsIt.make_(async function* repeat(from, times, strOk, ...args) {
  while (times--) yield* AsIt.getIter(from, strOk, ...args);
});

class ForkBufferLimitExceededError extends Error { message = 'fork buffer limit exceeded'; }
Object.assign(AsIt, {ForkBufferLimitExceededError});

async function* _fork(iter, limit, i) {
  const o = iter.forkObj;
  const {b, u} = o;

  try {
    while (true) {
      const d = i - o.i;

      if (d >= b.length) {
        if (o.wait) {
          await o.wait;
          continue;
        }

        o.wait = iter.next();
        const {value, done} = await o.wait;
        o.wait = null;
        if (done) return;

        if (o.n > 0) {
          u.push(o.n);
          if (b.push(value) === limit) throw new ForkBufferLimitExceededError();
          i++;
        }

        yield value;
      } else {
        if (--u[d] <= 0) {
          o.i++;
          u.shift();
          yield b.shift();
        } else {
          yield b[d];
        }

        i++;
      }
    }
  } finally {
    const l = b.length;

    if (l) {
      for (let d = i - o.i; d < l; d++) u[d]--;
      //if (!u[l - 1]) { o.i += l; b.splice(0); u.splice(0); }
    }

    if (!(o.n--)) iter.forkObj = null;
  }
}

AsIt.value_(function fork(iter, limit) {
  if (iter.forkSrc) iter = iter.forkSrc;

  let o = iter.forkObj;

  if (o) {
    o.n++;
  } else {
    iter.forkObj = o = {b: [], u: [], i: 0, n: 0};
  }

  const forked = _fork.call(this, iter, limit, o.i);
  forked.forkSrc = iter;

  if (this instanceof AsIt) {
    const wrapped = new this.constructor(forked);
    return wrapped;
  } else {
    return forked;
  }
});

module.exports = AsIt;
