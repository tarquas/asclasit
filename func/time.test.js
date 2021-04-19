const $ = require('./time');

async function testTick(method) {
  let ticked = false;
  method().then(() => { ticked = true; });
  expect(ticked).toBe(false);
  await method();
  expect(ticked).toBe(true);
}

test('$.tick: delay execution in 1 eventloop spin', async () => {
  await testTick($.tick);
});

test('$.delayMsec: delay execution in 1 eventloop spin', async () => {
  await testTick($.delayMsec);
});

test('$.delaySec: delay execution in 1 eventloop spin', async () => {
  await testTick($.delaySec);
});

test('$.delayMsec, $.upSec: delay execution in msec, uptime in sec', async () => {
  const snap = $.upSec();
  await $.delayMsec(200);
  expect($.upSec(snap).toPrecision(1)).toBe('0.2');
});

test('$.delayMsec, $.upNsec: delay execution in msec, uptime in nsec', async () => {
  const snap = $.upNsec();
  await $.delayMsec(100);
  expect(Number($.upNsec(snap)).toPrecision(1)).toBe('1e+8');
});

test('$.delaySec, $.upMsec: delay execution in sec, uptime in msec', async () => {
  const snap = $.upMsec();
  await $.delaySec(0.3);
  expect($.upMsec(snap).toPrecision(1)).toBe('3e+2');
});

test('$.delaySec_: delay execution of func in tick', async () => {
  await testTick($.delaySec_());
});

test('$.delaySec_: delay execution of func in sec', async () => {
  const msec = $.delaySec_(0.1);
  const snap = $.upMsec();
  const promises = [1, 2, 3].map(msec);
  await Promise.all(promises);
  expect($.upMsec(snap).toPrecision(1)).toBe('1e+2');
});

test('$.timeoutMsec: timeout execution in msec', async () => {
  const snap = $.upSec();
  try { await $.timeoutMsec(200); }
  catch (err) {
    expect(err.constructor).toBe($.TimeoutError);
    expect(err.message).toBe('timeout');
    expect($.upSec(snap).toPrecision(1)).toBe('0.2');
  }
});

test('$.timeoutSec: timeout execution in sec', async () => {
  const snap = $.upMsec();
  try { await $.timeoutSec(0.3, new Error('custom error')); }
  catch (err) {
    expect(err.constructor).toBe(Error);
    expect(err.message).toBe('custom error');
    expect($.upMsec(snap).toPrecision(1)).toBe('3e+2');
  }
});

test('$.timeoutSec: sync timeout', async () => {
  let ticked = null;
  $.timeoutSec().catch((err) => { ticked = err; });
  expect(ticked).toBe(null);
  await $.tick();
  expect(ticked instanceof $.TimeoutError).toBe(true);
});

test('$.msec_: execution time exceeds given maximum msec', async () => {
  const msec = $.msec_(200);
  expect(msec()).toBe(false);
  await $.delayMsec(100);
  expect(msec()).toBe(false);
  await $.delayMsec(300);
  expect(msec()).toBe(true);
});

test('$.sec_: execution time exceeds given maximum sec', async () => {
  const sec = $.sec_();
  expect(sec()).toBe(false);
  await $.delaySec(0.1);
  expect(sec()).toBe(false);
});
