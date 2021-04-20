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

function* chunkByCountFunc(iter, count, ...funcs) {
  let desc = {buf: [], idx: 0, iter, ctx: this};

  for (const item of iter) {
    let newChunk = false;

    for (const func of funcs) {
      if (func && func.call(this, item, desc)) {
        newChunk = true;
      }
    }

    if (newChunk && desc.buf.length) {
      yield desc.buf;
      desc.buf = [];
    }

    if (desc.buf.push(item) === count) {
      yield desc.buf;
      desc.buf = [];
    }

    desc.idx++;
  }

  if (desc.buf.length) yield desc.buf;
}

chain_(function* chunk(iter, count, func, ...funcs) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, 0, count, func, ...funcs);
  else if (typeof func === 'function') yield* chunkByCountFunc(iter, count, func, ...funcs);
  else yield* chunkByCount(iter, count);
});

function* flatten(iter, depth) {
  if (depth == null) { depth = 1; }
  else if (depth === 0) { yield* iter; return; }

  for (const item of iter) {
    const it = Iter.getIter(item);

    if (!it) yield item;
    else if (depth === 1) yield* it;
    else yield* flatten(it, depth - 1);
  }
}

chain_(flatten);

module.exports = Iter;
