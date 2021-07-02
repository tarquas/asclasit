const AsIt = require('./promise');
const Iter = require('../iter');
require('./make');
const $ = require('../func');

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

  const top = await AsIt.from(src).race().toArray();

  expect(top).toEqual([
    ['c', 'C'],
    ['b', new $.RaceError('B')],
    ['a', 'A'],
  ]);

  const top2 = await AsIt.from(src).race().toArray();

  expect(top2).toEqual([
    ['b', new $.RaceError('B')],
    ['c', 'C'],
    ['a', 'A'],
  ]);
});
