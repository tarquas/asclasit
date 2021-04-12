const AsIt = require('./base');
const {make_} = AsIt;

async function* from(arg) {
  const iter = AsIt.getIter(arg);
  if (iter) yield* iter; else yield arg;
}

make_(from);

make_(async function* concat(...args) {
  for await (const arg of args) {
    yield* from(arg);
  }
});

module.exports = AsIt;
