const $ = require('../base');
require('./object');
require('./map');

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
    let funcBinds = boundOnce.get(ofn);
    let func, map;
    const byRef = to && typeof to === 'object';

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

module.exports = $;
