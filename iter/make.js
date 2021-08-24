const Iter = require('./object');

Iter.chain_(function* voidIter() { }, 'void');

Iter.chain_(function* from(arg, strOk) {
  const iter = Iter.getIter(arg, strOk);

  if (iter) yield* iter;
  else if (typeof arg === 'object') yield* Iter.objectEntries.gen(arg);
  else yield arg;
});

Iter.chain_(function* concat(...args) {
  for (const arg of args) {
    yield* Iter.from.gen(arg);
  }
});

Iter.chain_(Iter.concat.gen, 'append');

Iter.chain_(function* prepend(...args) {
  for (let i = args.length - 1; i >= 0; i--) {
    yield* Iter.from.gen(args[i]);
  }
});

Iter.make_(function* range(from, to, step) {
  if (to == null) { to = from; from = 0; }
  if (!step) step = 1;
  if ((from < to) ^ (step > 0)) step = -step;

  if (step > 0) {
    for (let v = from; v < to; v += step) yield v;
  } else {
    for (let v = from; v > to; v += step) yield v;
  }
});

Iter.chain_(function* reverse(iter) {
  if (!(iter instanceof Array)) iter = Array.from(iter);

  for (let i = iter.length - 1; i >= 0; i--) {
    yield iter[i];
  }
});

class ForkBufferLimitExceededError extends Error { message = 'fork buffer limit exceeded'; }
Object.assign(Iter, {ForkBufferLimitExceededError});

function* _fork(iter, limit, i) {
  const o = iter.forkObj;
  const {b, u} = o;

  try {
    while (true) {
      const d = i - o.i;

      if (d >= b.length) {
        const {value, done} = iter.next();
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

Iter.value_(function fork(iter, limit) {
  if (iter.forkSrc) iter = iter.forkSrc;

  let o = iter.forkObj;

  if (o) {
    o.n++;
  } else {
    iter.forkObj = o = {b: [], u: [], i: 0, n: 0};
  }

  const forked = _fork.call(this, iter, limit, o.i);
  forked.forkSrc = iter;

  if (this.constructor === Iter) {
    const wrapped = new Iter(forked);
    return wrapped;
  } else {
    return forked;
  }
});

module.exports = Iter;
