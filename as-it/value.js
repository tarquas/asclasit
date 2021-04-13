const AsIt = require('./base');

const {value_} = AsIt;

value_(async function array(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
});

value_(async function set(iter) {
  const res = new Set();
  for await (const item of iter) res.add(item);
  return res;
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
