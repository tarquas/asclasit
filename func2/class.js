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

  async wake(up, ctx, ...args) {
    //if (this.#shutdown) throw new InstShutdownError();

    let ready = this.#waking;
    if (ready) await ready;
    this.#waking = ready = this.#wake();
    await ready;
    
    try {
      if (typeof up === 'function') {
        const promise = up.apply(ctx, args);

        if (promise instanceof Promise) {
          try {
            this.#running.add(promise);
            const result = await promise;
            return result;
          } finally {
            this.#running.delete(promise);
          }
        } else {
          return promise;
        }
      } else {
        return up;
      }
    } finally {
      if (this.sleepImmediate) {
        this.sleep();
      } else if (this.sleepIdle) {
        if (this.#sleepTimer) clearTimeout(this.#sleepTimer);
        this.#sleepTimer = setTimeout(this.#sleepBound, this.sleepIdle);
      }
    }
  }

  async #wake() {
    try {
      if (this.#sleeping) await this.#sleeping;

      if (this.#sleepTimer) {
        clearTimeout(this.#sleepTimer);
        this.#sleepTimer = null;
      }

      this.#sleepTimer = null;

      outer: for (const o of Iter.reverse.gen(this.#protos)) {
        let retr = this.wakeRetries, tries = 1;

        while (true) {
          try {
            let life, ready;

            life = this.#life.get(o);

            if (!life) {
              life = Object.getOwnPropertyDescriptor(o, symbol);

              if (life && typeof life.value === 'function') {
                life = life.value.call(this.from, tries);
                this.#life.set(o, life);
              } else {
                continue outer;
              }
            }

            ready = life.next();

            if (ready.constructor === Promise) {
              let tm;
              if (this.wakeTimeout) ready = Promise.race([ready, tm = $.timeoutMsec(this.wakeTimeout, () => new WakeTimeoutError())]);
              ready = await ready;
              if (tm) tm.cancel();
            }

            if (ready.done) throw WakeFailedError;

            ready = ready.value;

            if (ready && ready.constructor === Promise) {
              let tm;
              if (this.wakeTimeout) ready = Promise.race([ready, tm = $.timeoutMsec(this.wakeTimeout, () => new WakeTimeoutError())]);
              ready = await ready;
              if (tm) tm.cancel();
            }
          } catch (err) {
            for (const u of this.#protos) {
              this.#life.delete(u);
              if (u === o) break;
            }

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
    } finally {
      this.#waking = null;
      this.#awake = true;
    }
  }

  async #sleep() {
    const errHandler = (this.onSleepError || $.defaultOnSleepError).bind(this.from);

    try {
      if (this.#running.size) await Promise.all(this.#running).catch($.null);

      if (this.#sleepTimer) clearTimeout(this.#sleepTimer);
      this.#sleepTimer = null;

      for (const o of this.#protos) {
        const life = this.#life.get(o);
        if (!life) continue;
        this.#life.delete(o);
        let wait;

        try {
          wait = life.return();

          if (wait instanceof Promise) {
            if (this.#sleepTimeout) wait = Promise.race([wait, this.#sleepTimeout]);
            await wait;
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
}

Design.$classApply($inst);

Object.assign($inst.$$, {
  wakeInit: false,
  wakeTimeout: 5000,
  wakeRetries: 3,
  wakeRetryDelay: 500,

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

$.$inst = $inst;

module.exports = $;
