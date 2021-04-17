const Iter = require('./base');

const {value_} = Iter;

value_(function toArray(iter) {
  return Array.from(iter);
});

value_(function toSet(iter) {
  return new Set(iter);
});

value_(function toObject(iter, value) {
  const obj = Object.create(null);

  for (const item of iter) {
    if (item instanceof Array) obj[item[0]] = item[1];
    else obj[item] = value;
  }

  return obj;
});

value_(function toMap(iter, value) {
  const map = new Map();

  for (const item of iter) {
    if (item instanceof Array) map.set(item[0], item[1]);
    else map.set(item, value);
  }

  return map;
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
