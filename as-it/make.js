const AsIt = require('./object');
const {make_} = AsIt;

make_(async function* from(arg, strOk) {
  const iter = AsIt.getIter(arg, strOk);

  if (iter) yield* iter;
  else if (typeof arg === 'object') yield* AsIt.objectEntries.raw(arg);
  else yield arg;
});

make_(async function* concat(...args) {
  for await (const arg of args) {
    yield* AsIt.from.raw(arg);
  }
});

module.exports = AsIt;
