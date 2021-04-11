const Iter = require('./base');
const {make_} = Iter;

function* from(arg) {
  const iter = Iter.getIter(arg);
  if (iter) yield* iter; else yield arg;
}

make_(from);

make_(function* concat(...args) {
  for (const arg of args) {
    yield* from(arg);
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
