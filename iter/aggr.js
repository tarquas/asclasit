const Iter = require('./base');
require('./object');
require('./value');
const $ = require('../func');

$.sortMin = 0;
$.sortMax = 2**32 - 1;

Iter.value_(function toRecentGroup(iter, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = Infinity; }
  let {to, group, skip, stopOnDropped, stopOnCond} = opts;
  if (!to) to = Object.create(null);
  const st = {nKeys: 0, nDropped: 0, idx: -1};

  for (const item of iter) {
    st.idx++;
    if (skip && skip--) continue;

    let [k, v] = item instanceof Array ? item : [item, 'count'];
    k = String(k);

    let ex = to[k];

    if (ex) {
      delete to[k];
      to[k] = ex;
    } else {
      ex = ($.accInit.get(group) || $)();

      if (st.nKeys >= limit) {
        if (++st.nDropped === stopOnDropped) { st.stopped = 'dropped'; break; }
        to[k] = ex;
        const first = Iter.objectKeys(to).first();
        delete to[first];
        if (first === k) continue;
      } else {
        to[k] = ex;
        st.nKeys++;
      }
    }

    if (stopOnCond && stopOnCond.call(this, ex, k, v, st)) { st.stopped = 'cond'; break; }
    $.accumulate(ex, v);
  }

  Object.assign(opts, st);
  return to;
});

Iter.value_(function toOrderGroup(iter, limit = Infinity, opts = {}) {
  if (typeof limit === 'object') { opts = limit; limit = Infinity; }
  let {to, group, skip, stopOnDropped, stopOnCond} = opts;
  if (!to) to = Object.create(null);
  const st = {nKeys: 0, nDropped: 0, idx: -1};

  for (const item of iter) {
    st.idx++;
    if (skip && skip--) continue;

    let [k, v] = item instanceof Array ? item : [item, 'count'];
    k = String(k);

    let ex = to[k];

    if (!ex) {
      ex = ($.accInit.get(group) || $)();

      if (st.nKeys >= limit) {
        if (++st.nDropped === stopOnDropped) { st.stopped = 'dropped'; break; }
        to[k] = ex;
        const first = Iter.objectKeys(to).first();
        delete to[first];
        if (first === k) continue;
      } else {
        to[k] = ex;
        st.nKeys++;
      }
    }

    if (stopOnCond && stopOnCond.call(this, ex, k, v, st)) { st.stopped = 'cond'; break; }
    $.accumulate(ex, v);
  }

  Object.assign(opts, st);
  return to;
});

module.exports = Iter;
