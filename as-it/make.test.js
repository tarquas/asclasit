const AsIt = require('./make');

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
