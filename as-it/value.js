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

module.exports = AsIt;
