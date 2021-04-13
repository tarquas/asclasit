const Iter = require('./base');

const {value_} = Iter;

value_(function array(iter) {
  return Array.from(iter);
});

value_(function set(iter) {
  return new Set(iter);
});

value_(function count(iter) {
  let c = 0;
  for (const item of iter) c++;
  return c;
});

value_(function exec(iter) {
  for (const item of iter);
});

value_(function first(iter) {
  for (const item of iter) return item;
});

value_(function last(iter) {
  let last;
  for (const item of iter) last = item;
  return last;
});

module.exports = Iter;
