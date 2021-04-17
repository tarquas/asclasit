const Iter = require('./object');
const {make_} = Iter;

make_(function* from(arg, strOk) {
  const iter = Iter.getIter(arg, strOk);

  if (iter) yield* iter;
  else if (typeof arg === 'object') yield* Iter.objectEntries.raw(arg);
  else yield arg;
});

make_(function* concat(...args) {
  for (const arg of args) {
    yield* Iter.from.raw(arg);
  }
});

make_(function* range(from, to, step) {
  if (to == null) { to = from; from = 0; }
  if (!step) step = from > to ? -1 : 1;

  if (step > 0) {
    for (let v = from; v < to; v += step) yield v;
  } else {
    for (let v = from; v > to; v += step) yield v;
  }
});

module.exports = Iter;
