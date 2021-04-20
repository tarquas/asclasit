const AsIt = require('./base');
const $ = require('../func');

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

async function* chunkByCountFunc(iter, msec, count, ...funcs) {
  let snap = msec && $.upMsec();
  let desc = {buf: [], idx: 0, snap, iter, ctx: this};

  for await (const item of iter) {
    let newChunk = false;

    for (const func of funcs) {
      if (func && await func.call(this, item, desc)) {
        newChunk = true;
        break;
      }
    }

    if (msec && !newChunk && $.upMsec(desc.snap) > msec) {
      newChunk = true;
    }

    if (newChunk && desc.buf.length) {
      yield desc.buf;
      desc.buf = [];
    }

    if (msec) {
      if (newChunk) desc.snap = snap;
      snap = $.upMsec();
    }

    if (desc.buf.push(item) === count) {
      newChunk = true;
      yield desc.buf;
      desc.buf = [];
      desc.snap = snap;
    }

    desc.idx++;
  }

  if (desc.buf.length) yield desc.buf;
}

chain_(async function* chunk(iter, count, func, ...funcs) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, 0, 0, count, func, ...funcs);
  else if (typeof func === 'function') yield* chunkByCountFunc(iter, 0, count, func, ...funcs);
  else yield* chunkByCount(iter, count);
});

chain_(async function* chunkMsec(iter, msec, count, func, ...funcs) {
  if (typeof count === 'function') yield* chunkByCountFunc(iter, msec, 0, count, func, ...funcs);
  yield* chunkByCountFunc(iter, msec, count, func, ...funcs);
});

async function* flatten(iter, depth) {
  if (depth == null) { depth = 1; }
  else if (depth === 0) { yield* iter; return; }

  for await (const item of iter) {
    const it = AsIt.getIter(item);

    if (!it) yield item;
    else if (depth === 1) yield* it;
    else yield* flatten(it, depth - 1);
  }
}

chain_(flatten);

module.exports = AsIt;
