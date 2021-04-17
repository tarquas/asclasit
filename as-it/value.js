const AsIt = require('./base');

const {value_} = AsIt;

value_(async function toArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
});

value_(async function toSet(iter) {
  const res = new Set();
  for await (const item of iter) res.add(item);
  return res;
});


value_(async function toObject(iter, value) {
  const obj = Object.create(null);

  for await (const item of iter) {
    if (item instanceof Array) obj[item[0]] = item[1];
    else obj[item] = value;
  }

  return obj;
});

value_(async function toMap(iter, value) {
  const map = new Map();

  for await (const item of iter) {
    if (item instanceof Array) map.set(item[0], item[1]);
    else map.set(item, value);
  }

  return map;
});

value_(async function count(iter) {
  let c = 0;
  for await (const item of iter) c++;
  return c;
});

value_(async function exec(iter) {
  for await (const item of iter);
});

value_(async function first(iter) {
  for await (const item of iter) return item;
});

value_(async function last(iter) {
  let last;
  for await (const item of iter) last = item;
  return last;
});

module.exports = AsIt;
