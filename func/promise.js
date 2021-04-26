const $ = require('../base');

const {func_} = $;

func_(async function promiseAll(promises) {
  return await Promise.all(promises);
});

module.exports = $;
