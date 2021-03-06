const AsIt = require('./promise');
require('./make');
const $ = require('../func2/promise');

test('AsIt_.race: race promises', async () => {
  const src = {
    a: $.delayMsec(60).then(() => 'A'),
    b: $.delayMsec(40).then(() => 'B'),
    c: $.delayMsec(20).then(() => 'C'),
  };

  const top = await AsIt.from(src).race().toArray();

  expect(top).toEqual([
    ['c', 'C'],
    ['b', 'B'],
    ['a', 'A'],
  ]);
});

test('AsIt_.race: race chunked', async () => {
  const src = {
    a: $.delayMsec(60).then(() => 'A'),
    b: $.delayMsec(50).then(() => 'B'),
    c: $.delayMsec(40).then(() => 'C'),
    x: 'X',
    d: $.delayMsec(30).then(() => 'D'),
    y: Promise.resolve('Y'),
    e: $.delayMsec(20).then(() => 'E'),
  };

  const top = await AsIt.from(src).concat('0').concat({1: $.reject('1')}).race(3).toArray();

  expect(top).toEqual([
    ['c', 'C'],
    ['x', 'X'],
    ['d', 'D'],
    ['y', 'Y'],
    ['e', 'E'],
    ['0', '0'],
    ['1', new $.RaceError('1')],
    ['b', 'B'],
    ['a', 'A'],
  ]);
});

test('AsIt_.race: twice race', async () => {
  const src = {
    a: () => $.delayMsec(60).then(() => 'A'),
    b: $.delayMsec(40).then(() => $.reject('B')),
    c: $.delayMsec(20).then(() => 'C'),
  };

  const top = await AsIt.from(src).map($.mapper).race().toArray();

  expect(top).toEqual([
    ['c', 'C'],
    ['b', new $.RaceError('B')],
    ['a', 'A'],
  ]);

  const top2 = await AsIt.from(src).map($.mapper).race().toArray();

  expect(top2).toEqual([
    ['b', new $.RaceError('B')],
    ['c', 'C'],
    ['a', 'A'],
  ]);
});

test('AsIt_.race: internal mapping', async () => {
  const msec = AsIt.from([240, 160, 200, 1]);

  const arr = await msec.race(2, async (msec) => {
    await $.delayMsec(msec);
    return msec;
  }).map($.inValue).toArray();

  expect(arr).toEqual([160, 240, 1, 200]);
});
