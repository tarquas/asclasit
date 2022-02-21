const AsIt = require('./make');
const Iter = require('../iter');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('AsIt.void: void iterator', async () => {
  const wrapped = AsIt.void();
  expect(wrapped instanceof AsIt).toBe(true);
  expect(await asItArray(wrapped)).toEqual([]);
});

test('AsIt.shim: compatible iterator', async () => {
  const src = {arr: [1, 2, 3], async next() {
    return {done: !this.arr.length, value: this.arr.pop()};
  }};

  expect(await asItArray(AsIt.shim(src))).toEqual([3, 2, 1]);
});

test('AsIt.concat: concatenate iterators', async () => {
  const i1 = ['a1', 'a2'];
  const i2 = async function* () { yield 'a4'; yield 'a5'; } ();
  const i3 = new AsIt(['a6', 'a7'][Symbol.iterator]());
  const concat = AsIt.concat(i1, 3, {a: 1}, i2, i3);
  expect(await asItArray(concat)).toEqual(['a1', 'a2', 3, ['a', 1], 'a4', 'a5', 'a6', 'a7']);
});

test('AsIt.prepend: concatenate iterators reversed', async () => {
  const i1 = ['a1', 'a2'];
  const i2 = async function* () { yield 'a4'; yield 'a5'; } ();
  const i3 = new AsIt(['a6', 'a7'][Symbol.iterator]());
  const concat = AsIt.prepend(i1, 3, {a: 1}, i2, i3);
  expect(await asItArray(concat)).toEqual(['a6', 'a7', 'a4', 'a5', ['a', 1], 3, 'a1', 'a2']);
});

test('AsIt.fork: 1 fork', async () => {
  const src = AsIt.from([1, 2, 3]);
  const fork1 = src.fork();
  expect(await asItArray(fork1)).toEqual([1, 2, 3]);
  expect(await asItArray(src)).toEqual([]);
});

test('AsIt_.fork: 2 forks', async () => {
  const src = AsIt.from([1, 2, 3]);
  const fork1 = src.fork();
  const fork2 = src.fork();
  expect(await asItArray(fork1)).toEqual([1, 2, 3]);
  expect(await asItArray(fork2)).toEqual([1, 2, 3]);
  expect(await asItArray(src)).toEqual([]);
});

test('AsIt_.fork: 3 forks with 1 chained', async () => {
  const src = AsIt.from([1, 2, 3]);
  const fork1 = src.fork();
  const fork2 = src.fork();
  const fork3 = fork2.fork();
  expect(await asItArray(fork1)).toEqual([1, 2, 3]);
  expect(await asItArray(fork2)).toEqual([1, 2, 3]);
  expect(await asItArray(fork3)).toEqual([1, 2, 3]);
  expect(await asItArray(src)).toEqual([]);
});

test('AsIt_.fork: 3*3 forks', async () => {
  const src = AsIt.from([1, 2, 3]);
  const fork = () => src.fork();

  await Promise.all(Iter.range(9).map(fork).chunk(3).map(async (f) => {
    for (const s of f) {
      expect(await asItArray(s)).toEqual([1, 2, 3]);
    }
  }).toArray());

  expect(await asItArray(src)).toEqual([]);
});

test('AsIt_.fork: 2 forks: mixed pipeline', async () => {
  const src = AsIt.from([1, 2, 3]);
  const fork1 = src.fork();
  const fork2 = src.fork();
  expect(await fork1.read()).toBe(1);
  expect(await asItArray(fork2)).toEqual([1, 2, 3]);
  expect(await asItArray(fork1)).toEqual([2, 3]);
  expect(await asItArray(src)).toEqual([]);
});

test('AsIt_.fork: 3 forks: one broken', async () => {
  const src = AsIt.from([1, 2, 3]);
  const fork1 = src.fork();
  const fork2 = src.fork();
  const fork3 = src.fork();
  expect(await fork1.read()).toBe(1);
  expect(await asItArray(fork2)).toEqual([1, 2, 3]);
  expect(await asItArray(fork3)).toEqual([1, 2, 3]);
  await fork1.return();
  expect(await asItArray(src)).toEqual([]);
});

test('AsIt_.fork: 1 fork: break limit ok', async () => {
  const src = AsIt.from([1, 2, 3]);
  const fork1 = src.fork(2);
  expect(await asItArray(fork1)).toEqual([1, 2, 3]);
  expect(await asItArray(src)).toEqual([]);
});

test('AsIt_.fork: 2 forks', async () => {
  const src = AsIt.from([1, 2, 3]);
  const fork1 = src.fork(2);
  const fork2 = src.fork(2);
  let error;

  try {
    await asItArray(fork1);
  } catch (err) {
    error = err;
  }

  expect(error instanceof AsIt.ForkBufferLimitExceededError).toBe(true);
  expect(await asItArray(src)).toEqual([3]);
});

test('AsIt_.fork: 2 raw forks', async () => {
  const src = async function* () { yield 1; yield 2; yield 3; } ();
  const fork1 = AsIt.fork(src);
  const fork2 = AsIt.fork(src);
  expect(await asItArray(fork1)).toEqual([1, 2, 3]);
  expect(await asItArray(fork2)).toEqual([1, 2, 3]);
  expect(await asItArray(src)).toEqual([]);
});

test('AsIt.repeat: repeat iterable', async () => {
  expect(await asItArray(AsIt.repeat([1, 2, 3], 3))).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
});

test('AsIt.repeat: repeat characters', async () => {
  expect(await asItArray(AsIt.repeat('123', 3, true))).toEqual(['1', '2', '3', '1', '2', '3', '1', '2', '3']);
});
