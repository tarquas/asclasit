const X = module.exports;

try {
  const streams = require('stream/promises');
  X.finished = streams.finished;
} catch (err) {
  const {promisify} = require('util');
  const streams = require('stream');
  X.finished = promisify(streams.finished);
}
