const AsIt = require('./base');

async function* asIt(iter) { yield* iter; }

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('new AsIt: wrap to iterator', () => {
  const wrapped = new AsIt(asIt([]));
  expect(typeof wrapped[AsIt.wrapped].next).toBe('function');
});

test('AsIt.getGen: is generator', () => {
  const gen = AsIt.getGen(async function* () {});
  expect(typeof gen).toBe('function');
  expect(typeof gen().next).toBe('function');
});

test('AsIt.getGen: get bound generator', () => {
  const gen = AsIt.getGen([]);
  expect(typeof gen).toBe('function');
  expect(typeof gen().next).toBe('function');
});

test('AsIt.getGen: get bound async generator', () => {
  const gen = AsIt.getGen(asIt([]));
  expect(typeof gen).toBe('function');
  expect(typeof gen().next).toBe('function');
});

test('AsIt.getGen: not iterator object', () => {
  const gen = AsIt.getGen('123');
  expect(gen).toBe(null);
});

test('AsIt.getGen: not an iterator', () => {
  const gen = AsIt.getGen({});
  expect(gen).toBe(null);
});

test('AsIt.getIter: from generator', () => {
  const iter = AsIt.getIter(async function* () {});
  expect(typeof iter.next).toBe('function');
});

test('AsIt.getIter: bound iterator', () => {
  const iter = AsIt.getIter([]);
  expect(typeof iter.next).toBe('function');
});

test('AsIt.getIter: not iterator object', () => {
  const iter = AsIt.getIter('345');
  expect(iter).toBe(null);
});

test('AsIt.getIter: not an iterator', () => {
  const iter = AsIt.getIter({});
  expect(iter).toBe(null);
});

test('AsIt.chainWrap: wrap generator to chain method', async () => {
  const gen = async function* (iter) { for await (const x of iter) yield x + 1; };
  const chain = AsIt.chainWrap(gen);
  expect(typeof chain).toBe('function');
  const wrapped = new AsIt(asIt([1, 2, 16]));
  expect(chain.call(wrapped)).toBe(wrapped);
  expect(await asItArray(wrapped[AsIt.wrapped])).toEqual([2, 3, 17]);
});

test('AsIt.make_: define make generator', async () => {
  AsIt.make_(async function* myMake(a, b) { for (let x = a; x > 0; x -= b) yield x; });
  const wrapped = AsIt.myMake(10, 2);
  expect(wrapped instanceof AsIt).toBe(true);
  expect(await asItArray(wrapped)).toEqual([10, 8, 6, 4, 2]);
});

test('AsIt.chain_: define chain generator', async () => {
  AsIt.chain_(async function* myChainGen(iter, less) { for await (const x of iter) yield x - less; });
  const wrapped = new AsIt([8, 4, 1, 9][Symbol.iterator]());
  wrapped.myChainGen(1).myChainGen(2);
  expect(await asItArray(wrapped)).toEqual([5, 1, -2, 6]);
});

test('AsIt.value_: define value function', async () => {
  AsIt.value_(async function mySquareSum(iter) {
    let sum = 0; for await (const x of iter) sum += x * x; return sum; });
  const wrapped = new AsIt([2, 1, 0, -1][Symbol.iterator]());
  const sum = await wrapped.myChainGen(1).mySquareSum();
  expect(sum).toEqual(6);
});

test('AsIt_[@@iterator]: iterate wrapped', async () => {
  const src = [1, 2, 5];
  const wrapped = new AsIt(src[Symbol.iterator]());
  expect(await asItArray(wrapped)).toEqual(src);
});

test('AsIt_.next: take values', async () => {
  const myGen = async function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new AsIt(myGen());
  expect(await wrapped.next(true)).toEqual({done: false, value: 6});
  expect(await wrapped.next(true)).toEqual({done: false, value: 4});
  expect(await asItArray(wrapped)).toEqual([3, 2, 1, 0]);
});

test('AsIt_.next: take values from generic iterator', async () => {
  const myGen = async function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const iter = myGen();
  expect(await AsIt.next(iter, true)).toEqual({done: false, value: 6});
  expect(await AsIt.next(iter, true)).toEqual({done: false, value: 4});
  expect(await asItArray(iter)).toEqual([3, 2, 1, 0]);
});

test('AsIt_.return: break in the middle', async () => {
  const myGen = async function* () {
    try {
      let c = 100;
      while (c--) yield c;
    } finally {
      yield 'end';
    }
  };

  const wrapped = new AsIt(myGen());
  expect(await wrapped.next()).toEqual({done: false, value: 99});
  expect(await wrapped.next()).toEqual({done: false, value: 98});
  expect(await wrapped.return()).toEqual({done: false, value: 'end'});
  expect(await wrapped.next()).toEqual({done: true});
});

test('AsIt_.throw: break with exception', async () => {
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

  const wrapped = new AsIt(myGen());
  expect(await wrapped.next()).toEqual({done: false, value: 9});
  expect(await wrapped.next()).toEqual({done: false, value: 8});
  expect(await wrapped.throw(new Error('enough'))).toEqual({done: false, value: 'broken with enough'});
  expect(await asItArray(wrapped)).toEqual(['end']);
});

test('AsIt_.read: read value', async () => {
  const myGen = async function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new AsIt(myGen());
  expect(await wrapped.read(true)).toEqual(6);
  expect(wrapped.cur).toEqual(1);
  expect(await wrapped.read(true)).toEqual(4);
  expect(wrapped.cur).toEqual(2);
  expect(await asItArray(wrapped)).toEqual([3, 2, 1, 0]);
});

test('AsIt_.ffwd: fast forward values', async () => {
  const myGen = async function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new AsIt(myGen());
  expect(await wrapped.ffwd(2, true)).toEqual({done: false, value: 4});
  expect(wrapped.cur).toEqual(2);
  expect(await asItArray(wrapped)).toEqual([3, 2, 1, 0]);
});

test('AsIt_.ffwd: fast forward beyond', async () => {
  const myGen = async function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new AsIt(myGen());
  expect(await wrapped.ffwd(10, true)).toEqual({done: true});
  expect(wrapped.cur).toEqual(null);
  expect(await asItArray(wrapped)).toEqual([]);
});

test('AsIt_.ffwd: fast forward generic iter beyond', async () => {
  const myGen = async function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const iter = myGen();
  expect(await AsIt.ffwd(iter, 10, true)).toEqual({done: true});
  expect(await asItArray(iter)).toEqual([]);
});

test('AsIt_.affwd: async fast forward values', async () => {
  const myGen = async function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new AsIt(myGen());
  expect(await wrapped.affwd(2, true)).toEqual({done: false, value: 4});
  expect(wrapped.cur).toEqual(2);
  expect(await asItArray(wrapped)).toEqual([3, 2, 1, 0]);
});

test('AsIt_.affwd: async fast forward beyond', async () => {
  const myGen = async function* () { let c = 7; while (c-- > 0) if (yield c) c--; };
  const wrapped = new AsIt(myGen());
  expect(await wrapped.affwd(10, true)).toEqual({done: true});
  expect(wrapped.cur).toEqual(null);
  expect(await asItArray(wrapped)).toEqual([]);
});
