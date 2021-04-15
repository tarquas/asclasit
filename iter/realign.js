const Iter = require('./base');

const {chain_} = Iter;

function* chunkByCount(iter, count) {
  let buf = [];

  for (const item of iter) {
    if (buf.push(item) === count) {
      yield buf;
      buf = [];
    }
  }

  if (buf.length) yield buf;
}

function* chunkByCountFunc(iter, count, func) {
  let buf = [];
  let idx = 0;
  let desc = {buf, it: iter, iter: this};

  for (const item of iter) {
    const newChunk = func.call(this, item, idx, desc);

    if (newChunk) {
      if (buf.length) yield buf;
      buf = [];
      desc = {buf, it: iter, iter: this};
    }

    if (buf.push(item) === count) {
      yield buf;
      buf = [];
      desc = {buf, it: iter, iter: this};
    }

    idx++;
  }

  if (buf.length) yield buf;
}

chain_(function* chunk(iter, count, func) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, 0, count);
  else if (typeof func === 'function') yield* chunkByCountFunc(iter, count, func);
  else yield* chunkByCount(iter, count);
});

function* flatten(iter, depth) {
  if (depth == null) { depth = 1; }
  else if (depth === 0) { yield* iter; return; }

  for (const item of iter) {
    const it = Iter.getIter(item);
    if (!it) yield item; else if (depth === 1) yield* it; else yield* flatten(it, depth - 1);
  }
}

chain_(flatten);

module.exports = Iter;
