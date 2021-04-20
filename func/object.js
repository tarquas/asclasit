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

func_(function unset(obj, ...walk) {
  const key = walk.pop();
  const ctx = walk.length ? $.in_(...walk)(obj) : obj;
  if (!ctx) return;
  const prev = ctx[key];
  delete ctx[key];
  return prev;
});

module.exports = $;
