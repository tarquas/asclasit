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

chain_(AsIt.concat.gen, 'append');

chain_(async function* prepend(...args) {
  for (let i = args.length - 1; i >= 0; i--) {
    yield* AsIt.from.gen(args[i]);
  }
});

module.exports = AsIt;
