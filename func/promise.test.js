const $ = require('./promise');

test('$.promiseAll: ', async () => {
  const all = await $.promiseAll([1, Promise.resolve(2)]);
  expect(all).toEqual([1, 2]);
});
