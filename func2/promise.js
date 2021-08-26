const $ = require('../func');
require('./acc');
const Iter = require('../iter');

const util = require('util');
const streams = require('stream/promises');

const {func_} = $;

func_(function _bind(wrapper, binder, object, ...allArgs) {
  const [method, ...args] = allArgs;
  if (typeof method === 'function') return binder(wrapper, method, object || this, ...args);

  if (typeof method === 'string') {
    const obj = object || this;
    return binder(wrapper, obj[method], obj, ...args);
  }

  if (method && method[Symbol.iterator]) {
    const obj = object || this;
    const wrap = $();
    const arg0 = args[0];

    if (arg0 == null) {
      for (const key of method) wrap[key] = binder(wrapper, obj[key], null);
    } else if (typeof arg0 === 'boolean') {
      const rest = args.slice(1);
      if (arg0) for (const key of method) wrap[key] = binder(wrapper, obj[key], obj, ...rest);
      else for (const key of method) wrap[key] = binder(wrapper, obj[key], wrap, ...rest);
    } else {
      for (const key of method) wrap[key] = binder(wrapper, obj[key], ...args);
    }

    return wrap;
  }

  if (typeof object === 'function') return binder(wrapper, object, null);
  if (typeof object === 'object') throw new $.NotImplementedError();
  return binder(wrapper, this[object], ...allArgs);
});

func_(function bind_(wrapper, ofn, obj, ...args) {
  let func = wrapper(ofn);
  if (obj !== null) func = func.bind(obj, ...args);
  return func;
});

const boundOnce = new WeakMap();

func_(function bindOnce__(to) {
  return function (wrapper, ofn, obj, ...args) {
    const byRef = to && (typeof to === 'object' || typeof to === 'function');
    let funcBinds = boundOnce.get(ofn);
    let func, map;

    if (!funcBinds) {
      funcBinds = Object.create(null);
      funcBinds.val = new Map();
      funcBinds.ref = new WeakMap();
      boundOnce.set(ofn, funcBinds);
      func = false;
    }

    map = byRef ? funcBinds.ref : funcBinds.val;

    if (func == null) {
      func = map.get(to);
    }

    if (!func) {
      func = wrapper(ofn);
      if (obj !== null) func = func.bind(obj, ...args);
      map.set(to, func);
    }

    return func;
  };
});

func_(function promisify(object, ...args) {
  return $._bind.call(this, util.promisify, $.bind_, object, ...args);
});

func_(function promisifyOnce(to, object, ...args) {
  return $._bind.call(this, util.promisify, $.bindOnce__(to), object, ...args);
});

func_(function bind(object, ...args) {
  return $._bind.call(this, $.echo, $.bind_, object, ...args);
});

func_(function bindOnce(to, object, ...args) {
  return $._bind.call(this, $.echo, $.bindOnce__(to), object, ...args);
});

//TODO: bindJob in ClAs

func_(function finished(stream, opts) {
  return streams.finished(stream, opts);
});

func_(function finishedRead(stream, opts) {
  return streams.finished(stream, {writable: false, ...opts});
});

func_(function finishedWrite(stream, opts) {
  return streams.finished(stream, {readable: false, ...opts});
});

func_(function all(promises) {
  return Promise.all(promises);
});

func_(function race(promises) {
  for (const idx in promises) {
    const promise = promises[idx];
    if (!(promise instanceof Promise)) return [idx, promise];

    if ($.promiseIsError in promise) {
      const data = promise[$.promiseValue];
      if (promise[$.promiseIsError]) return [idx, new $.RaceError(data)];
      return [idx, data];
    }
  }

  return racePending(promises);
});

const raceMap = new Map();
$.promiseValue = Symbol('$.promiseValue');
$.promiseIsError = Symbol('$.promiseIsError');

function racePending(promises) {
  let trigger;

  const result = new Promise((resolve, reject) => {
    trigger = {resolve, reject};
  });

  const tMap = new Map();
  trigger.map = tMap;

  for (const idx in promises) {
    const promise = promises[idx];
    let map = raceMap.get(promise);

    if (!map) {
      map = new Map();
      raceMap.set(promise, map);
      promise.then(raceDone(promise, false), raceDone(promise, true));
    }

    map.set(trigger, idx);
    tMap.set(map, idx);
  }

  return result;
}

function raceDone(promise, error) {
  return (data) => {
    const map = raceMap.get(promise);
    //if (!map) return;
    raceMap.delete(promise);
    promise[$.promiseIsError] = error;
    promise[$.promiseValue] = data;

    for (const [trigger, idx] of map.entries()) {
      for (const submap of trigger.map.keys()) {
        submap.delete(trigger);
      }

      trigger.map.clear();
      delete trigger.map;
      const action = trigger.resolve;
      delete trigger.resolve;
      delete trigger.reject;
      action([idx, error ? new $.RaceError(data) : data]);
    }

    map.clear();
  };
}

func_(function reject(value) {
  const promise = Promise.reject(value);
  promise.catch($.echo);
  return promise;
});

$.RaceError = class RaceError extends Error {
  constructor(error) {
    super('Error in $.race');
    this.error = error;
  }
}

const eventMethods = {
  once: ['once'],
  on: ['addListener', 'addEventListener', 'on'],
  off: ['removeListener', 'removeEventListener', 'off'],
};

func_(function grabEvents(from, events, {
  methods = eventMethods,
  limit = Infinity,
  grabbed = [],
  handler,
} = {}) {
  if (!(limit > 0)) return grabbed;

  let on, off;
  for (const method of methods.on) if (typeof from[method] === 'function') { on = method; break; }
  if (!on) return null;
  for (const method of methods.off) if (typeof from[method] === 'function') { off = method; break; }
  if (!off) return null;

  let subs = Object.create(null);
  if (typeof events === 'string') events = events.split(',');
  if (!(events instanceof Set)) events = new Set(events);

  let report;
  const wait = new Promise(resolve => report = resolve);

  const stop = () => {
    if (!subs) return grabbed;

    for (const event of events) {
      const func = subs[event];
      delete subs[event];
      from[off](event, func);
    }

    subs = null;
    report(grabbed);
    return grabbed;
  };

  wait.stop = stop;
  let n = 0;

  const grab = function (event, ...args) {
    if (!subs || n >= limit) return;
    grabbed.push({event, args, at: new Date()});
    if (++n >= limit) stop();
    if (handler) return handler.call(this, event, ...args);
  };

  for (const event of events) {
    const func = grab.bind(this, event);
    from[on](event, func);
    subs[event] = func;
  }

  return wait;
});

func_(async function firstEvent(from, resolves, rejects, opts = {}) {
  if (!rejects) rejects = ['error'];
  if (typeof resolves === 'string') resolves = resolves.split(',');
  if (typeof rejects === 'string') rejects = rejects.split(',');
  if (!(rejects instanceof Set)) rejects = new Set(rejects);
  const promise = $.grabEvents(from, new Set([...resolves, ...rejects]), {...opts, limit: 1});
  opts.stop = promise.stop;
  const [grabbed] = await promise;
  if (!grabbed) return null;
  Object.assign(opts, grabbed);
  const {event, args} = grabbed;
  if (rejects.has(event)) throw args[0];
  return args[0];
});

const callOnceMap = new WeakMap();

async function callOnceExpire(fn, msec) {
  await $.delayMsec(msec);
  callOnceMap.delete(fn);
}

async function callOnceTimer(obj, fn, msec, ...args) {
  obj.promise = fn.call(this, ...args);
  await obj.promise.catch($.null);

  if (msec) {
    obj.timer = callOnceExpire(fn, msec);
  } else {
    callOnceMap.delete(fn);
  }
}

function callOnceSet(fn, msec, ...args) {
  const obj = {};
  obj.timer = callOnceTimer.call(this, obj, fn, msec, ...args);
  callOnceMap.set(fn, obj);
  return obj.promise;
}

func_(async function once(fn, msec, ...args) {
  if (typeof fn !== 'function') fn = this[fn];
  const has = callOnceMap.get(fn);
  if (has) return await has.promise;

  const promise = callOnceSet.call(this, fn, msec, ...args);
  const res = await promise;
  return res;
});

func_(async function only(fn, msec, ...args) {
  if (typeof fn !== 'function') fn = this[fn];

  while (true) {
    const has = callOnceMap.get(fn);
    if (!has) break;
    await has.timer;
  }

  const promise = callOnceSet.call(this, fn, msec, ...args);
  const res = await promise;
  return res;
});

const throttleMap = new WeakMap();

func_(function accCall(fn, msec, obj) {
  if (typeof fn !== 'function') fn = this[fn];
  const cur = throttleMap.get(fn);

  let acc;

  if (cur) {
    acc = cur.acc;
    $.accumulate(acc, obj);
    if (msec) cur.time = msec;
    return cur.finaled;
  } else {
    acc = $.initAcc(obj);
    $.accumulate(acc, obj);
  }

  const newCur = {acc, time: msec, ctx: this};
  throttleMap.set(fn, newCur);
  return timeThrottleTimeout(fn);
});

async function timeThrottleTimeout(fn) {
  const cur = throttleMap.get(fn);
  const {acc, time, ctx, ok, nok} = cur;

  let has = false;
  const iter = acc[Symbol.iterator];

  if (iter) {
    for (const key of iter.call(acc)) { has = true; break; }
  } else {
    for (const key in acc) { has = true; break; }
  }

  if (!has) {
    throttleMap.delete(fn);
    if (cur.ok) cur.ok(null);
    return null;
  }

  cur.acc = $.initAcc(acc);

  try {
    cur.finaled = new Promise((ok, nok) => {
      cur.ok = ok;
      cur.nok = nok;
    });

    cur.finaled.catch($.null);

    delete cur.result;
    delete cur.error;
    const res = await fn.call(ctx, acc);
    cur.result = res;
    if (ok) ok(res); else return res;
  } catch (err) {
    cur.error = err;
    if (nok) nok(err); else throw err;
  } finally {
    if (time) {
      setTimeout(timeThrottleTimeout, time, fn);
    } else {
      setImmediate(timeThrottleTimeout, fn);
    }
  }
}

func_(function accCallCached(fn) {
  if (typeof fn !== 'function') fn = this[fn];
  const pending = throttleMap.get(fn);
  if (!pending) return null;
  return pending.acc;
});

func_(function throw_(title) {
  return function _throw(err) {
    let out = !err ? err : err.stack || err.message || err.type || err.code || err;
    if (title) out = `${title}\n${out}`;
    console.error(out);
  }
});

const locks = new Map();

func_(async function lock(to) {
  while (true) {
    const ex = locks.get(to);
    if (!ex) break;
    await ex.promise;
  }

  let unlock;
  const promise = new Promise(resolve => unlock = resolve);
  locks.set(to, {promise, unlock});
});

func_(function unlock(to) {
  const ex = locks.get(to);
  if (!ex) return false;
  locks.delete(to);
  ex.unlock();
  return true;
});

func_(async function lockCall(fn, ...args) {
  await $.lock(fn);

  try {
    return await fn.call(this, ...args);
  } finally {
    $.unlock(fn);
  }
});

func_(async function waitLocks() {
  while (locks.size) {
    const promises = Iter.values(locks).map('promise');
    await Promise.all(promises);
  }
});

const exitSignals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
let signalCaught = false;
let signalBound = null;
let originalProcessExit = null;

const signalExitCodes = Object.assign(Object.create(null), {
  SIGHUP: 129,
  SIGINT: 130,
  SIGTERM: 143,
});

$.onShutdownError = $.throw_('Error in shutdown');

const getSignalFunc = (msec, after = $.aecho, before = $.aecho) => async function (signal) {
  const code = typeof signal === 'number' ? signal : signalExitCodes[signal] || 2;

  if (!signalCaught) {
    signalCaught = true;
    const args = [signal, code, msec];

    await Promise.race([
      (async () => {
        await before.call(this, ...args);
        await $.waitLocks();
        await after.call(this, ...args)
      })().catch($.onShutdownError),
      $.delayMsec(msec)
    ]);
  }

  $.delayShutdown(0);
  return process.exit(code);
}

func_(function delayShutdown(msec, {after, before} = {}) {
  if (originalProcessExit) {
    process.exit = originalProcessExit;
    originalProcessExit = null;
  }

  if (signalBound) {
    for (const signal of exitSignals) {
      process.off(signal, signalBound);
    }

    signalBound = null;
  }

  if (!(msec > 0)) return;

  originalProcessExit = process.exit;
  signalBound = getSignalFunc(msec, after, before);
  process.exit = signalBound;

  for (const signal of exitSignals) {
    process.on(signal, signalBound);
  }
});

module.exports = $;
