const eof = Symbol('eof');
const voidIter = { [Symbol.iterator]() { return this; }, next() { return {done: true}; } };
module.exports = {eof, voidIter};
