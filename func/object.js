const $ = require('./map');

const {func_} = $;

func_(function get(obj, ...walk) {
  const value = $.in_(...walk)(obj);
  return value;
});

func_(function getDef(obj, ...walk) {
  const def = walk.pop();
  if (!walk.length) return def;
  const key = walk.pop();
  const ctx = walk.length ? $.in_(...walk)(obj) : obj;
  if (!ctx || !(key in ctx)) return def;
  return ctx[key];
});

func_(function set(obj, ...walk) {
  const value = walk.pop();
  const {ctx, key} = $.to_(...walk)(obj);
  const prev = ctx[key];
  ctx[key] = value;
  return prev;
});

func_(function setDef(obj, ...walk) {
  const value = walk.pop();
  const {ctx, key} = $.to_(...walk)(obj);
  const prev = ctx[key];
  if (key in ctx) return prev;
  ctx[key] = value;
  return prev;
});

func_(function def(obj, ...walk) {
  const type = walk.pop();
  const {ctx, key} = $.to_(...walk)(obj);
  if (key in ctx) return (typeof type === 'function' || typeof type === 'object') ? ctx[key] : ctx;
  if (typeof type === 'function') return ctx[key] = new type();
  if (typeof type === 'object') return ctx[key] = Object.create(type);
  ctx[key] = type;
  return ctx;
});

func_(function defs(obj, ...walk) {
  const type = walk.pop();
  const {ctx, key} = $.to_(...walk)(obj);

  if (key in ctx) {
    const prev = ctx[key];

    if (typeof type === 'function') {
      if (typeof prev === 'object' && prev instanceof type) return prev;
      return ctx[key] = new type();
    }

    if (typeof type === 'object') {
      if (typeof prev === 'object' && Object.getPrototypeOf(prev) === type) return prev;
      return ctx[key] = Object.create(type);
    }

    if (typeof type !== typeof prev) ctx[key] = type;
    return ctx;
  }

  if (typeof type === 'function') return ctx[key] = new type();
  if (typeof type === 'object') return ctx[key] = Object.create(type);
  ctx[key] = type;
  return ctx;
});

func_(function defMap(map, key, type) {
  let ex = map.get(key);
  if (ex) return ex;
  if (typeof type === 'function') ex = new type();
  else if (typeof type === 'object') ex = Object.create(type);
  else ex = type;
  map.set(key, ex);
  return ex;
});

func_(function defsMap(map, key, type) {
  let ex = map.get(key);
  if (ex) {
    if (typeof type === 'function' && typeof ex === 'object' && ex instanceof type) return ex;
    if (typeof type === 'object' && typeof ex === 'object' && Object.getPrototypeOf(ex) === type) return ex;
  }
  if (typeof type === 'function') ex = new type();
  else if (typeof type === 'object') ex = Object.create(type);
  else ex = type;
  map.set(key, ex);
  return ex;
});

func_(function unset(obj, ...walk) {
  const key = walk.pop();
  const ctx = walk.length ? $.in_(...walk)(obj) : obj;
  if (!ctx) return;
  const prev = ctx[key];
  delete ctx[key];
  return prev;
});

func_(function invert(obj) {
  if (obj == null) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Array) return obj.reverse();

  if (obj instanceof Map) {
    const res = new Map();
    for (const [k, v] of obj.entries()) res.set(v, k);
    return res;
  }

  const res = Object.create(null);
  for (const key in obj) res[obj[key]] = key;
  return res;
});

func_(function toString() {
  return $.symbol;
});

/*Object.defineProperty(Object.prototype, $.symbol, {
  get() { return Object.setPrototypeOf(this, null); }
});*/

module.exports = $;
