const Emitter = require('events');
const $ = require('./promise');

test('$.bind: bind function', async () => {
  const func = async function (arg) { return arg + this.a; }
  const bound1 = $.bind({a: 1}, func);
  const bound2 = $.bind({a: 2}, func);
  expect(await bound1(5)).toBe(6);
  expect(await bound2(7)).toBe(9);
  expect(bound1 === bound2).toBe(false);
});

test('$.bindOnce: bind once by key', async () => {
  const handle = 'myHandle';
  const func = async function (arg) { return arg + this.a; }
  const bound1 = $.bindOnce(handle, {a: 1}, func);
  const bound2 = $.bindOnce(handle, {a: 2}, func);
  const bound3 = $.bindOnce(1, {a: 3}, func);
  expect(await bound1(5)).toBe(6);
  expect(await bound2(7)).toBe(8);
  expect(await bound3(-5)).toBe(-2);
  expect(bound1 === bound2).toBe(true);
  expect(bound1 === bound3).toBe(false);
});

test('$.promisify: promisify a function', async () => {
  const func = (arg, cb) => cb(null, arg + 1);
  const prom1 = $.promisify(func);
  const prom2 = $.promisify(func);
  expect(await prom1(5)).toBe(6);
  expect(await prom2(7)).toBe(8);
  expect(prom1 === prom2).toBe(false);
});

test('$.promisifyOnce: promisify once by key', async () => {
  const handle = $();
  const func = (arg, cb) => cb(null, arg + 1);
  const prom1 = $.promisifyOnce(handle, func);
  const prom2 = $.promisifyOnce(handle, func);
  const prom3 = $.promisifyOnce('handle', func);
  expect(await prom1(5)).toBe(6);
  expect(await prom2(7)).toBe(8);
  expect(await prom3(-2)).toBe(-1);
  expect(prom1 === prom2).toBe(true);
  expect(prom1 === prom3).toBe(false);
});

test('$.all: ', async () => {
  const all = await $.all([1, Promise.resolve(2)]);
  expect(all).toEqual([1, 2]);
});

test('$.race: array', async () => {
  const first = await $.race([
    $.delayMsec(100),
    $.delayMsec(50),
    $.delayMsec(150),
  ]);

  expect(first).toEqual(['1', undefined]);
});

test('$.race: object', async () => {
  const first = await $.race({
    a: $.delayMsec(60).then(() => 'A'),
    b: $.delayMsec(40).then(() => 'B'),
    c: $.delayMsec(20).then(() => 'C'),
  });

  expect(first).toEqual(['c', 'C']);
});

test('$.throw_: format error message', () => {
  const outs = [];
  const orig = console.error;
  console.error = (err) => outs.push(err);

  try {
    $.throw_('my title')(null);
    $.throw_('my title')('error');
  } finally {
    console.error = orig;
  }

  expect(outs).toEqual(['my title\nnull', 'my title\nerror']);
});

test('$.throw_: exit', () => {
  const bumped = [];
  const origExit = process.exit;
  const origError = console.error;
  process.exit = (code) => bumped.push(`exit ${code}`);
  console.error = (...ents) => bumped.push(...ents);

  try {
    $.throw_('fatal', {exitCode: 1})('test');
  } finally {
    console.error = origError;
    process.exit = origExit;
  }

  expect(bumped).toEqual(['fatal\ntest', 'exit 1']);
});

test('$.grabEvents: listen and store events', async () => {
  const ev = new Emitter();
  const events = [];
  const handler = (event) => events.push(event);
  const grabbing = $.grabEvents(ev, 'event1,event2', {limit: 3, handler});
  ev.emit('event2', {arg2: 2});
  ev.emit('event1', {arg1: 1});
  ev.emit('event0', {arg0: 0});
  ev.emit('event2', {arg2: 2});
  ev.emit('event1', {arg1: 1});
  ev.emit('event0', {arg0: 0});
  const grabbed = await grabbing;

  expect(grabbed.map(({event, args}) => [event, args])).toEqual([
    ['event2', [{arg2: 2}]],
    ['event1', [{arg1: 1}]],
    ['event2', [{arg2: 2}]],
  ]);

  expect(events).toEqual(['event2', 'event1', 'event2']);
  expect(grabbing.stop()).toEqual(grabbed);
});

test('$.grabEvents: zero limit', async () => {
  const ev = new Emitter();
  const grabbing = $.grabEvents(ev, 'event1,event2', {limit: 0});
  ev.emit('event2', {arg2: 2});
  ev.emit('event1', {arg1: 1});
  const grabbed = await grabbing;
  expect(grabbed).toEqual([]);
});

test('$.grabEvents: broken remover', async () => {
  const ev = {
    on(event, handler) {
      this.handler = handler;
    },
    off() { },
  };

  const grabbing = $.grabEvents(ev, 'event1,event2', {limit: 1});
  ev.handler('event1', {arg1: 1});
  ev.handler('event2', {arg2: 2});
  const grabbed = await grabbing;
  expect(grabbed.length).toBe(1);
});

test('$.grabEvents: no listener adder', async () => {
  const ev = {};
  const grabbing = $.grabEvents(ev, 'event1,event2', {limit: 1});
  expect(grabbing).toBe(null);
});

test('$.grabEvents: no listener remover', async () => {
  const ev = { on() { } };
  const grabbing = $.grabEvents(ev, 'event1,event2', {limit: 1});
  expect(grabbing).toBe(null);
});

test('$.firstEvent: resolve', async () => {
  const ev = new Emitter();
  const grabbing = $.firstEvent(ev, 'event1', 'event2');
  ev.emit('event1', {arg1: 1});
  ev.emit('event2', {arg2: 2});
  const grabbed = await grabbing;
  expect(grabbed).toEqual({arg1: 1});
});

test('$.firstEvent: reject', async () => {
  const ev = new Emitter();
  const grabbing = $.firstEvent(ev, 'event');
  ev.emit('error', {arg1: 1});
  ev.emit('event', {arg2: 2});

  try {
    await grabbing;
    throw $;
  } catch (err) {
    expect(err).toEqual({arg1: 1});
  }
});

test('$.firstEvent: stop', async () => {
  const ev = new Emitter();
  const out = {};
  const grabbing = $.firstEvent(ev, 'event1', 'event2', out);
  out.stop();
  const grabbed = await grabbing;
  expect(grabbed).toEqual(null);
});

test('$.once: deduplicate time-throttled function call and reuse pending result', async () => {
  let n = 0;
  const res = [];

  const bumper = {async bump() {
    await $.delayMsec(20);
    return n++;
  }};

  for (let i = 0; i < 9; i++) {
    $.once.call(bumper, 'bump', i ? 10 : 0).then(n => res.push(n));
    await $.delay(10);
  }

  expect(res).toEqual([0, 0, 1, 1, 1, 2, 2, 2]);
});

test('$.only: delay until previous call finished', async () => {
  let n = 0;
  const res = [];

  const bumper = {async bump() {
    await $.delayMsec(25);
    if (n++ > 2) throw res;
  }};

  const up = $.upMsec_();
  let last;

  for (let i = 0; i < 6; i++) {
    last = $.only.call(bumper, 'bump', i ? 25 : 0).catch($.echo).then(() => res.push((up() / 50) | 0));
    await $.delay(15);
  }

  await last;
  expect(res).toEqual([0, 1, 2, 3, 4, 5]);
});

test('$.only: atomics', async () => {
  const bumped = [];

  async function bump(bumpy) {
    await $.delayMsec(20);
    bumped.push(bumpy);
  }

  const bump2 = bump.bind($);

  $.only(bump, 0, 1);
  $.only(bump, 0, 2);
  $.only(bump, 0, 3);
  await $.delayMsec(10);
  $.only(bump2, 0, 4);
  $.only(bump2, 0, 5);
  await $.only(bump2, 0, 6);

  expect(bumped).toEqual([1, 4, 2, 5, 3, 6]);
});

test('$.accCall: debounce time-throttled function call with accumulating input parameter', async () => {
  let n = 0;
  const res = [];
  const errs = [];

  const bumper = {async bump(pack) {
    await $.delayMsec(38);
    res.push(pack);
    if (n++ > 1) throw n;
  }};

  const up = $.upMsec_();
  let last;

  for (let i = 0; i < 9; i++) {
    last = $.accCall.call(bumper, 'bump', i ? 100 : 0, [i]).catch(pack => errs.push(pack));
    await $.delay(40);
  }

  await last;
  expect(res).toEqual([[0], [1], [2, 3, 4], [5, 6, 7], [8]]);
  expect(errs).toEqual([3, 3, 3, 4, 4, 4, 5]);
  expect($.accCallCached.call(bumper, 'bump')).toEqual([]);
});

test('$.accCall, $.accCallCached: first reject', async () => {
  async function thrower(acc) { throw acc; };

  try {
    await $.accCall(thrower, 0, {a: 1});
    throw $;
  } catch (err) {
    expect(err).toEqual({a: 1});
  }

  expect($.accCallCached(thrower)).toEqual({});
  await $.tick(); // expire throttling
  expect($.accCallCached(thrower)).toEqual(null);

  try {
    await $.accCall(thrower, 0, {a: 2});
    throw $;
  } catch (err) {
    expect(err).toEqual({a: 2});
  }
});

test('$.lockCall: atomics', async () => {
  const bumped = [];

  async function bump(bumpy) {
    await $.delayMsec(20);
    bumped.push(bumpy);
  }

  const bump2 = bump.bind($);

  $.lockCall(bump, 1);
  $.lockCall(bump, 2);
  $.lockCall(bump, 3);
  await $.delayMsec(10);
  $.lockCall(bump2, 4);
  $.lockCall(bump2, 5);
  await $.lockCall(bump2, 6);

  expect(bumped).toEqual([1, 4, 2, 5, 3, 6]);
});

test('$.delayShutdown: process exit', async () => {
  const bumped = [];

  async function bump(bumpy) {
    await $.delayMsec(20);
    bumped.push(bumpy);
  }

  expect($.unlock(bump)).toBe(false);

  const origExit = process.exit;
  process.exit = (code) => bumped.push(`exit ${code}`);

  try {
    $.delayShutdown(50, {
      before(sig, code) { bumped.push(`before ${sig} ${code}`); },
      after(sig, code) { bumped.push(`after ${sig} ${code}`); },
    });

    let last;
    for (let i = 0; i < 5; i++) last = $.lockCall(bump, i);
    process.exit();
    await last;
    $.delayShutdown(0);
  } finally {
    process.exit = origExit;
  }

  expect(bumped).toEqual(['before undefined 2', 0, 1, 'exit 2', 2, 3, 4]);
});

test('$.delayShutdown: double signal', async () => {
  const bumped = [];

  async function bump(bumpy) {
    await $.delayMsec(20);
    bumped.push(bumpy);
  }

  expect($.unlock(bump)).toBe(false);

  const origExit = process.exit;
  process.exit = () => bumped.push('exit');

  try {
    $.delayShutdown(50);
    let last;
    for (let i = 0; i < 5; i++) last = $.lockCall(bump, i);
    process.exit(1);
    process.exit();
    await last;
    $.delayShutdown(0);
  } finally {
    process.exit = origExit;
  }

  expect(bumped).toEqual(['exit', 'exit', 0, 1, 2, 3, 4]);
});
