const Iter = require('./base');
require('./object');
require('./value');
const $ = require('../func2/acc');

$.sortMin = 0;
$.sortMax = 2**32 - 1;

Iter.chain_(function *recentGroup(iter, to, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = opts.limit || Infinity; }
  let {group, skip, stopOnDropped, stopOnCond} = opts;
  Object.assign(opts, {nKeys: 0, nDropped: 0, idx: -1});

  for (const item of iter) {
    opts.idx++;
    if (skip && skip--) { yield item; continue; };

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

    if (stopOnCond && stopOnCond.call(this, ex, k, v, opts)) { opts.stopped = 'cond'; break; }
    $.accumulate(ex, v);
    yield item;
  }
});

Iter.value_(function toRecentGroup(iter, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = opts.limit || Infinity; }
  if (!opts.to) opts.to = Object.create(null);
  for (const item of Iter.recentGroup.gen(iter, opts.to, limit, opts));
  return opts.to;
});

Iter.chain_(function *orderGroup(iter, to, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = opts.limit || Infinity; }
  let {group, skip, stopOnDropped, stopOnCond} = opts;
  Object.assign(opts, {nKeys: 0, nDropped: 0, idx: -1});

  for (const item of iter) {
    opts.idx++;
    if (skip && skip--) { yield item; continue; };

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

    if (stopOnCond && stopOnCond.call(this, ex, k, v, opts)) { opts.stopped = 'cond'; break; }
    $.accumulate(ex, v);
    yield item;
  }

  Object.assign(opts, opts);
  return to;
});

Iter.value_(function toOrderGroup(iter, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = opts.limit || Infinity; }
  if (!opts.to) opts.to = Object.create(null);
  for (const item of Iter.orderGroup.gen(iter, opts.to, limit, opts));
  return opts.to;
});

module.exports = Iter;
