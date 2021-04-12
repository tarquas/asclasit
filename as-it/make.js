const AsIt = require('./base');
const {make_} = AsIt;

async function* from(arg, strOk) {
  const iter = AsIt.getIter(arg, strOk);
  if (iter) yield* iter; else yield arg;
}

make_(from);
AsIt._from = from;

make_(async function* concat(...args) {
  for await (const arg of args) {
    yield* from(arg);
  }
});

module.exports = AsIt;
