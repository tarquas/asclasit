const AsIt = require('./object');
const {chain_} = AsIt;

chain_(async function* voidIter() { }, 'void');

chain_(async function* from(arg, strOk) {
  const iter = AsIt.getIter(arg, strOk);

  if (iter) yield* iter;
  else if (typeof arg === 'object') yield* AsIt.objectEntries.gen(arg);
  else yield arg;
});

chain_(async function* concat(...args) {
  for await (const arg of args) {
    yield* AsIt.from.gen(arg);
  }
});

module.exports = AsIt;
