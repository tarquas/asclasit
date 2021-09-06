const $ = require('../base');

const {func_} = $;

func_(async function tick(value) {
  await new Promise(resolve => setImmediate(resolve));
  return value;
});

func_(function delayMsec(msec) {
  if (!msec) return new Promise(resolve => setImmediate(resolve));
  let cancel;
  const promise = new Promise((resolve) => {
    const tm = setTimeout(resolve, msec);
    cancel = () => { clearTimeout(tm); resolve(); };
  });
  promise.cancel = cancel;
  return promise;
});

func_(function delaySec(sec) {
  return $.delayMsec(sec * 1000);
});

func_(function delayMsec_(msec, out) {
  if (!msec) return $.tick;

  return async function delayed(value) {
    const promise = $.delayMsec(msec);
    if (out) out.cancel = promise.cancel;
    await promise;
    return value;
  };
});

func_(function delaySec_(sec, out) {
  return $.delayMsec_(sec * 1000, out);
});

func_($.delayMsec, 'delay');
func_($.delayMsec_, 'delay_');

class TimeoutError extends Error { message = 'timeout'; }
Object.assign($, {TimeoutError});

func_(function timeoutMsec(msec, err) {
  if (!err) err = new TimeoutError();

  if (msec) {
    let cancel;
    const promise = new Promise((resolve, reject) => {
      const tm = setTimeout(
        err => typeof err === 'function' ? reject(err.call(this)) : reject(err),
        msec, err
      );
      cancel = () => { clearTimeout(tm); resolve(); };
    });
    promise.cancel = cancel;
    return promise;
  }

  return new Promise((resolve, reject) => setImmediate(
    err => typeof err === 'function' ? reject(err.call(this)) : reject(err),
    err
  ));
});

func_(function timeoutSec(sec, err) {
  return $.timeoutMsec(sec * 1000, err);
});

func_($.timeoutMsec, 'timeout');

func_(function upNsec_(scale, out = {}) {
  const start = process.hrtime.bigint();
  out.start = start;
  out.last = start;

  const ret = function _up(last) {
    const snap = process.hrtime.bigint();
    const nsec = snap - (last ? out.last : start);
    out.last = snap;
    if (scale) return Number(nsec) / scale;
    return nsec;
  };

  ret.last = ret.bind(null, true);
  return ret;
});

func_(function upMsec_(out) {
  return $.upNsec_(1e6, out);
});

func_(function upSec_(out) {
  return $.upNsec_(1e9, out);
});

func_($.upMsec_, 'up_');

func_(function upNsec(prev) {
  const snap = process.hrtime.bigint();
  if (!prev) return snap;
  if (typeof prev !== 'object') return snap - prev;
  let res;
  if (prev.snap) res = snap - prev.snap; else res = null;
  prev.snap = snap;
  return res;
});

func_(function upMsec(prev) {
  const nsec = $.upNsec(prev);
  if (!prev || nsec == null) return nsec;
  return Number(nsec) / 1e6;
});

func_(function upSec(prev) {
  const nsec = $.upNsec(prev);
  if (!prev || nsec == null) return nsec;
  return Number(nsec) / 1e9;
});

func_($.upMsec, 'up');

func_(function time__(tm, def) {
  if (!tm) tm = $.upMsec;

  return function time_(max, prev) {
    if (!max) max = def || 1;
    if (!prev) prev = Object.create(null);

    const func = function time() {
      const time = tm(prev);
      return time > max;
    };

    func.timeHandle = prev;
    return func;
  };
});

func_($.time__($.upNsec, 10n ** 9n), 'nsec_');
func_($.time__(null, 1000), 'msec_');
func_($.time__($.upSec), 'sec_');

func_($.msec_, 'time_');

module.exports = $;
