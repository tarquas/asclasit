const AsIt = require('./make');
const Iter = require('../iter');
const $ = require('../func');

class Feed {
  active = true;
  buf = new $.DQ();

  clwait() {
    this.wait = null;
    this.resume = null;
  }

  mkwait() {
    this.wait = new Promise(resolve => this.resume = (mk) => {
      resolve();
      if (mk) this.mkwait(mk);
    });
  }

  constructor() {
    this.mkwait();
  }

  async *mkiter() {
    try {
      while (this.active) {
        while (this.buf.length) {
          yield this.buf.shift();
          if (this.taken) this.taken();
        }

        await this.wait;
      }

      while (this.buf.length) {
        yield this.buf.shift();
        if (this.taken) this.taken();
      }

      if (this.error) throw this.error;
    } finally {
      this.active = false;
      if (this.taken) this.taken();
      this.resume();
      this.clwait();
      this.buf = null;
    }
  }
}

const feedMethods = {
  push(...items) {
    const {feed} = this;
    if (!feed.active) return this;
    const iter = Iter.concat.gen(...items);
    for (const item of iter) feed.buf.push(item);
    feed.resume(true);
    return this;
  },

  async apush(...items) {
    const {feed} = this;
    if (!feed.active) return this;
    const iter = AsIt.concat.gen(...items);
    for await (const item of iter) feed.buf.push(item);
    feed.resume(true);
    return this;
  },

  end() {
    const {feed} = this;
    if (!feed.active) return this;
    feed.active = false;
    feed.resume();
    return this;
  },
};

AsIt.feed = function feed(...inits) {
  const feed = new Feed();
  const iter = new this(feed.mkiter());
  Object.assign(iter, {feed}, feedMethods);
  if (inits.length) iter.push(...inits);
  return iter;
};

$.feed = AsIt.feed.bind(AsIt);

async function prefetchWorker(iter, funcs) {
  const {feed} = this;

  try {
    const {buf} = feed;
    const desc = {iter, ctx: this, feed, buf};

    for await (const item of iter) {
      if (!feed.active) break;
      buf.push(item);

      while (true) {
        if (!feed.active || !buf.length) break;
        let stop = false;

        for (const func of funcs) {
          if (typeof func === 'number') {
            if (stop = buf.length >= func) break;
          } else {
            if (stop = await func.call(this, item, buf.first, desc)) break;
          }
        }

        if (stop) {
          const taken = new Promise(resolve => feed.taken = resolve);
          feed.resume(true);
          await taken;
          feed.taken = null;
        } else {
          feed.resume(true);
          break;
        }
      }
    }
  } catch (err) {
    feed.error = err;
  } finally {
    this.end();
  }
}

AsIt.chain_(async function* prefetch(iter, ...funcs) {
  if (!funcs.length) return yield* iter;

  const feed = $.feed();
  prefetchWorker.call(feed, iter, funcs);

  const out = AsIt.getIter(feed);
  yield* out;
});

module.exports = AsIt;
