const AsIt = require('./make');

async function asItArray(iter) {
  const res = [];
  for await (const item of iter) res.push(item);
  return res;
}

test('AsIt.concat: concatenate iterators', async () => {
  const i1 = ['a1', 'a2'];
  const i2 = async function* () { yield 'a4'; yield 'a5'; } ();
  const i3 = new AsIt(['a6', 'a7'][Symbol.iterator]());
  const concat = AsIt.concat(i1, 3, i2, i3);
  expect(await asItArray(concat)).toEqual(['a1', 'a2', 3, 'a4', 'a5', 'a6', 'a7']);
});
