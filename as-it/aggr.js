const AsIt = require('./base');
const Iter = require('../iter');
const $ = require('../func2/acc');

$.sortMin = 0;
$.sortMax = 2**32 - 1;

AsIt.chain_(async function *recentGroup(iter, to, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = opts.limit || Infinity; }
  let {group, skip, stopOnDropped, stopOnCond} = opts;
  Object.assign(opts, {nKeys: 0, nDropped: 0, idx: -1});

  for await (const item of iter) {
    opts.idx++;
    if (skip && skip--) { yield item; continue; }

    let [k, v] = item instanceof Array ? item : [item, 'count'];
    k = String(k);

    let ex = to[k];

    if (ex) {
      delete to[k];
      to[k] = ex;
    } else {
      ex = ($.accInit.get(group) || $)();

      if (opts.nKeys >= limit) {
        if (++opts.nDropped === stopOnDropped) { opts.stopped = 'dropped'; break; }
        to[k] = ex;
        const first = Iter.objectKeys(to).first();
        delete to[first];
        if (first === k) { yield item; continue; };
      } else {
        to[k] = ex;
        opts.nKeys++;
      }
    }

    if (stopOnCond && await stopOnCond.call(this, ex, k, v, opts)) { opts.stopped = 'cond'; break; }
    $.accumulate(ex, v);
    yield item;
  }
});

AsIt.value_(async function toRecentGroup(iter, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = opts.limit || Infinity; }
  if (!opts.to) opts.to = Object.create(null);
  for await (const item of AsIt.recentGroup.gen(iter, opts.to, limit, opts));
  return opts.to;
});

AsIt.chain_(async function *orderGroup(iter, to, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = opts.limit || Infinity; }
  let {group, skip, stopOnDropped, stopOnCond} = opts;
  Object.assign(opts, {nKeys: 0, nDropped: 0, idx: -1});

  for await (const item of iter) {
    opts.idx++;
    if (skip && skip--) { yield item; continue; }

    let [k, v] = item instanceof Array ? item : [item, 'count'];
    k = String(k);

    let ex = to[k];

    if (!ex) {
      ex = ($.accInit.get(group) || $)();

      if (opts.nKeys >= limit) {
        if (++opts.nDropped === stopOnDropped) { opts.stopped = 'dropped'; break; }
        to[k] = ex;
        const first = Iter.objectKeys(to).first();
        delete to[first];
        if (first === k) { yield item; continue; };
      } else {
        to[k] = ex;
        opts.nKeys++;
      }
    }

    if (stopOnCond && await stopOnCond.call(this, ex, k, v, opts)) { opts.stopped = 'cond'; break; }
    $.accumulate(ex, v);
    yield item;
  }
});

AsIt.value_(async function toOrderGroup(iter, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = opts.limit || Infinity; }
  if (!opts.to) opts.to = Object.create(null);
  for await (const item of AsIt.orderGroup.gen(iter, opts.to, limit, opts));
  return opts.to;
});

module.exports = AsIt;
