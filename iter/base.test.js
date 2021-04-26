const Iter = require('./base');

test('new Iter: wrap to iterator', () => {
  const wrapped = new Iter([][Symbol.iterator]());
  expect(typeof wrapped[Iter.wrapped].next).toBe('function');
});

test('Iter.getGen: is generator', () => {
  const gen = Iter.getGen(function* () {});
  expect(typeof gen).toBe('function');
  expect(typeof gen().next).toBe('function');
});

test('Iter.getGen: get bound generator', () => {
  const gen = Iter.getGen([]);
  expect(typeof gen).toBe('function');
  expect(typeof gen().next).toBe('function');
});

test('Iter.getGen: not an iterator', () => {
  const gen = Iter.getGen({});
  expect(gen).toBe(null);
});

test('Iter.getGen: not iterator object', () => {
  const gen = Iter.getGen('123');
  expect(gen).toBe(null);
});

test('Iter.getIter: from generator', () => {
  const iter = Iter.getIter(function* () {});
  expect(typeof iter.next).toBe('function');
});

test('Iter.getIter: bound iterator', () => {
  const iter = Iter.getIter([]);
  expect(typeof iter.next).toBe('function');
});

test('Iter.getIter: not iterator object', () => {
  const iter = Iter.getIter('456');
  expect(iter).toBe(null);
});

test('Iter.getIter: not an iterator', () => {
  const iter = Iter.getIter({});
  expect(iter).toBe(null);
});

test('Iter.chainWrap: wrap generator to chain method', () => {
  const gen = function* (iter) { for (const x of iter) yield x + 1; };
  const chain = Iter.chainWrap(gen);
  expect(typeof chain).toBe('function');
  const wrapped = new Iter([1, 2, 16][Symbol.iterator]());
  expect(chain.call(wrapped)).toBe(wrapped);
  expect(Array.from(wrapped[Iter.wrapped])).toEqual([2, 3, 17]);
});

test('Iter.make_: define make generator', () => {
  Iter.make_(function* myMake(a, b) { for (let x = a; x > 0; x -= b) yield x; });
  const wrapped = Iter.myMake(10, 2);
  expect(wrapped instanceof Iter).toBe(true);
  expect(Array.from(wrapped)).toEqual([10, 8, 6, 4, 2]);
});

test('Iter.chain_: define chain generator', () => {
  Iter.chain_(function* myChainGen(iter, less) { for (const x of iter) yield x - less; });
  const wrapped = new Iter([8, 4, 1, 9][Symbol.iterator]());
  wrapped.myChainGen(1).myChainGen(2);
  expect(Array.from(wrapped)).toEqual([5, 1, -2, 6]);
});

test('Iter.value_: define value function', () => {
  Iter.value_(function mySquareSum(iter) {
    let sum = 0; for (const x of iter) sum += x * x; return sum; });
  const wrapped = new Iter([2, 1, 0, -1][Symbol.iterator]());
  const sum = wrapped.myChainGen(1).mySquareSum();
  expect(sum).toEqual(6);
});

test('Iter_[@@iterator]: iterate wrapped', () => {
  const src = [1, 2, 5];
  const wrapped = new Iter(src[Symbol.iterator]());
  expect(Array.from(wrapped)).toEqual(src);
});

test('Iter_.next: take values', () => {
  const myGen = function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new Iter(myGen());
  expect(wrapped.next(true)).toEqual({done: false, value: 6});
  expect(wrapped.next(true)).toEqual({done: false, value: 4});
  expect(Array.from(wrapped)).toEqual([3, 2, 1, 0]);
});

test('Iter_.next: take values of generic iterator', () => {
  const myGen = function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const iter = myGen();
  expect(Iter.next(iter, true)).toEqual({done: false, value: 6});
  expect(Iter.next(iter, true)).toEqual({done: false, value: 4});
  expect(Array.from(iter)).toEqual([3, 2, 1, 0]);
});

test('Iter_.return: break in the middle', () => {
  const myGen = function* () {
    try {
      let c = 100;
      while (c--) yield c;
    } finally {
      yield 'end';
    }
  };

  const wrapped = new Iter(myGen());
  expect(wrapped.next()).toEqual({done: false, value: 99});
  expect(wrapped.next()).toEqual({done: false, value: 98});
  expect(wrapped.return()).toEqual({done: false, value: 'end'});
  expect(wrapped.next()).toEqual({done: true});
});

test('Iter_.throw: break with exception', () => {
  const myGen = function* () {
    let c = 10;

    try {
      while (c--) yield c;
    } catch (err) {
      yield `broken with ${err.message}`;
    } finally {
      yield 'end';
    }
  }

  const wrapped = new Iter(myGen());
  expect(wrapped.next()).toEqual({done: false, value: 9});
  expect(wrapped.next()).toEqual({done: false, value: 8});
  expect(wrapped.throw(new Error('enough'))).toEqual({done: false, value: 'broken with enough'});
  expect(Array.from(wrapped)).toEqual(['end']);
});

test('Iter_.read: read value', () => {
  const myGen = function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new Iter(myGen());
  expect(wrapped.read(true)).toEqual(6);
  expect(wrapped.cur).toEqual(1);
  expect(wrapped.read(true)).toEqual(4);
  expect(wrapped.cur).toEqual(2);
  expect(Array.from(wrapped)).toEqual([3, 2, 1, 0]);
});

test('Iter_.ffwd: fast forward values', () => {
  const myGen = function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new Iter(myGen());
  expect(wrapped.ffwd(2, true)).toEqual({done: false, value: 4});
  expect(wrapped.cur).toEqual(2);
  expect(Array.from(wrapped)).toEqual([3, 2, 1, 0]);
});

test('Iter_.ffwd: fast forward beyond', () => {
  const myGen = function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new Iter(myGen());
  expect(wrapped.ffwd(10, true)).toEqual({done: true});
  expect(wrapped.cur).toEqual(null);
  expect(Array.from(wrapped)).toEqual([]);
});

test('Iter_.ffwd: fast forward generic iterator beyond', () => {
  const myGen = function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const iter = myGen();
  expect(Iter.ffwd(iter, 10, true)).toEqual({done: true});
  expect(Array.from(iter)).toEqual([]);
});
