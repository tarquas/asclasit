const $ = require('./promise');
require('./time');

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
