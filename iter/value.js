const Iter = require('./base');

const {value_} = Iter;

value_(function array(iter) { return Array.from(iter); });
value_(function set(iter) { return new Set(iter); });

module.exports = Iter;
