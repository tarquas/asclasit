const $ = require('../func');
require('./promise');
const Design = require('../design');
const Iter = require('../iter');

const {func_, symbol} = $;

class WakeTimeoutError extends Error {
  name = 'WakeTimeoutError';
  message = 'Async class instance initialization timeout';
};

class WakeFailedError extends Error {
  name = 'WakeFailedError';
  message = 'Async class instance initialization failed';
};

class SleepTimeoutError extends Error {
  name = 'SleepTimeoutError';
  message = 'Async class instance finalization timeout';
};

class AbstractClassError extends Error {
  name = 'AbstractClassError';
  message = 'Can\'t instantiate abstract class';
}

/*class InstShutdownError extends Error {
  type = 'InstShutdownError';
  message = 'Instance is shutting down';
}*/

Object.assign($, {WakeTimeoutError, WakeFailedError, SleepTimeoutError, AbstractClassError});

$.defaultOnSleepError = $.throw_('Async class instance finalization failed');
$.defaultEmitError = $.throw_('Event handler exception');

//const instsWoke = new Set();
//let instsShutdown = null;

class $inst {
  #life = new WeakMap();
  #protos = [];

  #running = new Set();
  get runningCount() { return this.#running.size; }
  get running() { return new Iter(this.#running); }

  #waking = null;
  get waking() { return this.#waking; }

  #awake = false;
  get awake() { return this.#awake; }

  #sleeping = null;
  get sleeping() { return this.#sleeping; }

  #sleepTimer;
  #sleepTimeout;
  #sleepBound = this.sleep.bind(this);

  //#shutdown = false;

  constructor(from) {
    for (let o = from.$$; o; o = o.$_) this.#protos.push(o);

    const desc = {
      from: {value: from},
    };

    Object.defineProperties(this, desc);
  }

  method_(proto, old, name) {
    const desc = Object.getOwnPropertyDescriptor(proto, old);
    if (typeof desc.get === 'function') desc.get = this.awake_(desc.get);
    if (typeof desc.set === 'function') desc.set = this.awake_(desc.set);
    if (typeof desc.value === 'function') desc.value = this.awake_(desc.value);
    Object.defineProperty(proto, name, desc);
  }

  awake_(up) {
    const name = up.name;

    const wrap = {[name](...args) {
      return this[symbol].wake(up, this, ...args);
    }};

    return wrap[name];
  }

  async #waitWake() {
    //if (this.#shutdown) throw new InstShutdownError();

    let ready = this.#waking;
    if (ready) await ready;

    try {
      this.#waking = ready = this.#wake();
      await ready;
    } finally {
      this.#waking = null;
    }

    this.#awake = true;
  }

  #planSleep() {
    if (this.#running.size) return;
    if (this.sleepImmediate) return this.sleep();
    if (!this.sleepIdle) return;
    //if (this.#sleepTimer) clearTimeout(this.#sleepTimer);
    this.#sleepTimer = setTimeout(this.#sleepBound, this.sleepIdle);
  }

  async #wakeValue(up) {
    await this.#waitWake();
    await this.#planSleep();
    return up;
  }

  wake(up, ctx, ...args) {
    if (typeof up !== 'function') return this.#wakeValue(up);
    const fnctor = up.constructor;
    if (fnctor === $.GeneratorFunction || fnctor === $.AsyncGeneratorFunction) return this.#wakeGen(up, ctx, ...args);
    return this.#wakeAsync(up, ctx, ...args);
  }

  async #wakeAsync(up, ctx, ...args) {
    let finished;
    const promise = new Promise(ok => finished = ok);
    this.#running.add(promise);
    await this.#waitWake();

    try {
      const result = up.apply(ctx, args);
      if (!(result instanceof Promise)) return result;
      return await result;
    } finally {
      this.#running.delete(promise);
      finished();
      this.#planSleep();
    }
  }

  async* #wakeGen(up, ctx, ...args) {
    let finished;
    const promise = new Promise(ok => finished = ok);
    this.#running.add(promise);
    await this.#waitWake();

    try {
      const iter = up.apply(ctx, args);
      yield* iter;
    } finally {
      this.#running.delete(promise);
      finished();
      this.#planSleep();
    }
  }

  async #wake() {
    if (this.#sleeping) await this.#sleeping;

    if (this.#sleepTimer) {
      clearTimeout(this.#sleepTimer);
      this.#sleepTimer = null;
    }

    outer: for (const o of Iter.reverse.gen(this.#protos)) {
      let retr = this.wakeRetries, tries = 1;

      while (true) {
        try {
          let life, ready;

          life = this.#life.get(o);

          if (!life) {
            life = Object.getOwnPropertyDescriptor(o, symbol);

            if (life && typeof life.value === 'function') {
              life = {iter: life.value.call(this.from, tries)};
              this.#life.set(o, life);
            } else {
              continue outer;
            }
          }

          ready = life.cur || life.iter.next();

          if (ready.constructor === Promise) {
            let tm;
            if (this.wakeTimeout) ready = Promise.race([ready, tm = $.timeoutMsec(this.wakeTimeout, () => new WakeTimeoutError())]);
            life.cur = ready;
            ready = await ready;
            life.cur = null;
            if (tm) tm.cancel();
          }

          if (ready.done) throw WakeFailedError;

          ready = ready.value;

          if (ready && ready.constructor === Promise) {
            let tm;
            if (this.wakeTimeout) ready = Promise.race([ready, tm = $.timeoutMsec(this.wakeTimeout, () => new WakeTimeoutError())]);
            life.cur = ready;
            ready = await ready;
            life.cur = null;
            if (tm) tm.cancel();
          }
        } catch (err) {
          for (const u of this.#protos) {
            this.#life.delete(u);
            if (u === o) break;
          }

          this.#awake = false;

          if (retr--) {
            tries++;
            if (this.wakeRetryDelay) await $.delayMsec(this.wakeRetryDelay);
            continue;
          }

          if (err === WakeFailedError) throw new WakeFailedError();
          throw err;
        }

        break;
      }
    }
  }

  async #sleep() {
    const errHandler = (this.onSleepError || $.defaultOnSleepError).bind(this.from);

    try {
      while (this.#running.size) await Promise.all(this.#running).catch($.null);

      if (this.#sleepTimer) clearTimeout(this.#sleepTimer);
      this.#sleepTimer = null;

      for (const o of this.#protos) {
        const life = this.#life.get(o);
        if (!life) continue;
        this.#life.delete(o);
        let wait;

        try {
          //if (life.cur) await life.cur;
          wait = life.iter.return();

          if (wait instanceof Promise) {
            if (this.#sleepTimeout) wait = Promise.race([wait, this.#sleepTimeout]);
            life.cur = wait;
            await wait;
            life.cur = null;
          }
        } catch (err) {
          errHandler(err);
          continue;
        }
      }
    } finally {
      this.#sleeping = null;
      this.#awake = false;
    }

    return true;
  }

  sleep() {
    if (!this.#awake) return null;
    if (this.#waking) return null;

    if (!this.#sleeping) {
      this.#sleepTimeout = this.sleepTimeout && $.timeoutMsec(this.sleepTimeout, () => new SleepTimeoutError());
      this.#sleeping = this.#sleep();
      if (this.#sleepTimeout) this.#sleeping.then(() => this.#sleepTimeout.cancel());
    }

    return this.#sleeping;
  }

  /*shutdown() {
    this.#shutdown = true;
    return this.sleep();
  }*/

  #events = Object.create(null);

  on(event, handler, {pre, once} = {}) {
    if (!event) return false;
    if (typeof handler !== 'function') return false;
    let handlers = this.#events[event];

    if (handlers) {
      if (handlers.pre.has(handler)) return false;
      if (handlers.post.has(handler)) return false;
    } else {
      this.#events[event] = handlers = {
        pre: new Set(),
        post: new Set(),
        once: new Set(),
      };

      handlers.emit = this.#emit.bind(this, handlers);
    }

    if (pre) handlers.pre.add(handler);
    else handlers.post.add(handler);

    if (once) handlers.once.add(handler);

    return true;
  }

  once(event, handler, opts) {
    return this.on(event, handler, {...opts, once: true});
  }

  offEvent(event) {
    const handlers = this.#events[event];
    if (!handlers) return false;

    handlers.pre.clear();
    handlers.post.clear();
    handlers.once.clear();
    delete this.#events[event];
    return true;
  }

  offAll() {
    let has = 0;

    for (const event in this.#events) {
      has |= this.offEvent(event);
    }

    return !!has;
  }

  off(event, handler) {
    if (!handler) {
      if (event) return this.offEvent(event);
      else return this.offAll();
    }

    const handlers = this.#events[event];
    if (!handlers) return false;

    handlers.once.delete(handler);

    if (handlers.pre.delete(handler)) {
      if (!handlers.pre.size && !handlers.post.size) delete this.#events[event];
      return true;
    }

    if (handlers.post.delete(handler)) {
      if (!handlers.pre.size && !handlers.post.size) delete this.#events[event];
      return true;
    }

    return false;
  }

  async emit(event, ...args) {
    const handlers = this.#events[event];
    if (!handlers) return;
    return await $.only(handlers.emit, 0, args);
  }

  async #emit(handlers, args) {
    const errHandler = this.throw || $.defaultEmitError;

    for (const handler of Iter.from(handlers.pre).reverse()) {
      if (!handlers.pre.has(handler)) continue;
      if (handlers.once.has(handler)) { handlers.pre.delete(handler); handlers.once.delete(handler); }

      try {
        const handled = await handler.call(this.from, ...args);
        if (handled === true) return true;
      } catch (err) {
        errHandler.call(this, err, 'emit');
      }
    }

    for (const handler of handlers.post) {
      //if (!handlers.post.has(handler)) continue;
      if (handlers.once.has(handler)) { handlers.post.delete(handler); handlers.once.delete(handler); }

      try {
        const handled = await handler.call(this.from, ...args);
        if (handled === true) return true;
      } catch (err) {
        errHandler.call(this, err, 'emit');
      }
    }

    return false;
  }
}

Design.$classApply($inst);

Object.assign($inst.$$, {
  wakeInit: false,
  wakeTimeout: 5000,
  wakeRetries: 3,
  wakeRetryDelay: 500,

  keepAlive: null, //TODO:
  fatalErrors: [], //TODO: $_method_ -- idempotent method (retry on fatal error)

  sleepImmediate: false,
  sleepIdle: 120000,
  sleepTimeout: 3000,
  onSleepError: null,
});

async function asyncCtor() {
  const inst = this[symbol];
  if (inst.wakeInit) await inst.wake();
}

func_(function ctor() {
  const c = this.constructor;
  if (!c) throw new AbstractClassError();
  const config = c[symbol];
  const isInst = Object.isPrototypeOf.call($inst, config);
  let inst;

  if (isInst) {
    inst = new config(this);
  } else {
    inst = new $inst(this);
    Object.assign(inst, config);
  }

  Object.defineProperty(this, symbol, {value: inst});
  Design.$instApply(inst);
  setImmediate(asyncCtor.bind(this));
});

$.Inst = $inst;

const IoCs = new WeakMap();

func_(function IoC(config, ...args) {
  let ofClass = IoCs.get(this);

  if (!ofClass) {
    ofClass = new WeakMap();
    IoCs.set(this, ofClass);
  }

  const exist = ofClass.get(config);
  if (exist) return exist;
  const inst = new this(config, ...args);
  ofClass.set(config, inst);
  return inst;
});

module.exports = $;
