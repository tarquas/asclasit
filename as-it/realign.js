const AsIt = require('./base');

const {chain_} = AsIt;

async function* chunkByCount(iter, count) {
  let buf = [];

  for await (const item of iter) {
    if (buf.push(item) === count) {
      yield buf;
      buf = [];
    }
  }

  if (buf.length) yield buf;
}

async function* chunkByCountFunc(iter, count, func) {
  let buf = [];
  let idx = 0;

  for await (const item of iter) {
    const newChunk = await func.call(this, item, {buf, idx, it: iter, iter: this});

    if (newChunk) {
      if (buf.length) yield buf;
      buf = [];
    }

    if (buf.push(item) === count) {
      yield buf;
      buf = [];
    }

    idx++;
  }

  if (buf.length) yield buf;
}

chain_(async function* chunk(iter, count, func) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, 0, count);
  else if (typeof func === 'function') yield* chunkByCountFunc(iter, count, func);
  else yield* chunkByCount(iter, count);
});

async function* flatten(iter, depth) {
  if (depth == null) { depth = 1; }
  else if (depth === 0) { yield* iter; return; }

  for await (const item of iter) {
    const it = AsIt.getIter(item);
    if (!it) yield item; else if (depth === 1) yield* it; else yield* flatten(it, depth - 1);
  }
}

chain_(flatten);

module.exports = AsIt;
