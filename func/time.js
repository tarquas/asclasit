const $ = require('../base');

const {func_} = $;

func_(async function tick(value) {
  await new Promise(resolve => setImmediate(resolve));
  return value;
});

func_(function delayMsec(msec) {
  if (msec) return new Promise(resolve => setTimeout(resolve, msec));
  return new Promise(resolve => setImmediate(resolve));
});

func_(function delaySec(sec) {
  return $.delayMsec(sec * 1000);
});

func_(function delayMsec_(msec) {
  if (!msec) return $.tick;

  return async function delayed(value) {
    await $.delayMsec(msec);
    return value;
  };
});

func_(function delaySec_(sec) {
  return $.delayMsec_(sec * 1000);
});

func_($.delayMsec, 'delay');
func_($.delayMsec_, 'delay_');

class TimeoutError extends Error { message = 'timeout'; }
Object.assign($, {TimeoutError});

func_(function timeoutMsec(msec, err) {
  if (!err) err = new TimeoutError();
  if (msec) return new Promise((resolve, reject) => setTimeout(reject, msec, err));
  return new Promise((resolve, reject) => setImmediate(reject, err));
});

func_(function timeoutSec(sec, err) {
  return $.timeoutMsec(sec * 1000, err);
});

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
