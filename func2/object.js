const $ = require('../func');
const Iter = require('../iter');

const {func_} = $;

function diffEntry(opts, [key, to, from]) {
  // value
  if (
    from == null || to == null ||
    typeof from !== 'object' || typeof to !== 'object'
  ) {
    if (from !== to) return [key, to];
    return null;
  }

  // object
  if (from === to) return null;
  const Class = $.getClass(from);
  if (Class !== $.getClass(to)) return [key, to];
  const diffFuncs = opts.diffFuncs || $.diffFuncs;
  const diffFunc = diffFuncs.get(Class) ?? diffObject;
  if (opts.circFrom.has(from) && opts.circTo.has(to)) return null;
  opts.circFrom.add(from);
  opts.circTo.add(to);
  const diff = diffFunc(from, to, opts);
  opts.circFrom.delete(from);
  opts.circTo.delete(to);
  if (diff) return [key, diff];
  return null;
}

function diffObject(from, to, opts = {}) {
  const diffEnt = diffEntry.bind(this, opts);
  const obj = Object.create(null);
  let n = Iter.objectEntries(to).mapTo(2, $.inKey, from).map(diffEnt).filter().appendObject(obj).count();

  if (opts.back) {
    const iter = Iter.objectEntries(from).filter($.inKey, $.has_(to), $.not);
    if (!opts.sym) iter.mapValue($._(opts.void));
    n += iter.appendObject(obj).count();
  }

  return n && obj;
}

function diffMap(from, to, opts = {}) {
  const diffEnt = diffEntry.bind(this, opts);
  const map = new Map();
  let n = Iter.entries(to).mapTo(2, $.inKey, from).map(diffEnt).filter().appendMap(map).count();

  if (opts.back) {
    const iter = Iter.entries(from).filter($.inKey, $.has_(to), $.not);
    if (!opts.sym) iter.mapValue($._(opts.void));
    n += iter.appendMap(map).count();
  }

  return n && map;
}

function diffSet(from, to, opts = {}) {
  const set = new Set();
  let n = Iter.keys(to).filter(from, $.not).appendSet(set).count();
  if (opts.back && opts.sym) n += Iter.keys(from).filter(to, $.not).appendSet(set).count();
  return n && set;
}

function diffArrayEntry(opts, from, v, k) {
  if (this.used) this.used.add(k);
  const diff = diffEntry(opts, [k, v, from[k]]);
  if (!diff) return;
  this.res[k] = diff[1];
  this.n++;
}

function diffArrayVoid(opts, v, k) {
  if (this.used.has(k)) return;
  this.res[k] = opts.sym ? v : opts.void;
  this.n++;
}

function diffArray(from, to, opts = {}) {
  const out = {n: 0, res: []};
  if (opts.back) out.used = new Set();
  to.forEach(diffArrayEntry.bind(out, opts, from));
  if (out.used) from.forEach(diffArrayVoid.bind(out, opts));
  return out.n && out.res;
}

const diffDate = (from, to) => (+from !== +to) && to;

$.diffFuncs = new Map([
  [Object, diffObject],
  [Map, diffMap],
  [Set, diffSet],
  [Array, diffArray],
  [Date, diffDate],
]);

func_(function diff(from, to, opts = {}) {
  if (!opts.circFrom) opts.circFrom = new Set();
  if (!opts.circTo) opts.circTo = new Set();
  const entry = diffEntry(opts, [, to, from]);
  if (!entry) return;
  return entry[1];
});

module.exports = $;
