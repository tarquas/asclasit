const AsIt = require('./base');
const Iter = require('../iter');
const $ = require('../func');

const {value_, chain_} = AsIt;

chain_(async function *appendArray(iter, to) {
  for await (const item of iter) {
    to.push(item);
    yield item;
  }
});

value_(async function toArray(iter, to) {
  if (!to) to = [];
  await AsIt.exec(AsIt.appendArray.gen(iter, to));
  return to;
});

chain_(async function *prependArray(iter, to) {
  for await (const item of iter) {
    to.unshift(item);
    yield item;
  }
});

value_(async function toPrependArray(iter, to) {
  if (!to) to = [];
  await AsIt.exec(AsIt.prependArray.gen(iter, to));
  return to;
});

chain_(async function *appendSet(iter, to) {
  for await (const item of iter) {
    to.add(item);
    yield item;
  }
});

value_(async function toSet(iter, to) {
  if (!to) to = new Set();
  await AsIt.exec(AsIt.appendSet.gen(iter, to));
  return to;
});

chain_(async function *appendXorSet(iter, xor) {
  if (!xor) xor = new Set();

  for await (const key of iter) {
    if (xor.has(key)) { xor.delete(key); yield false; }
    else { xor.add(key); yield true; }
  }
});

value_(async function toXorSet(iter, xor) {
  if (!xor) xor = new Set();
  await AsIt.exec(AsIt.appendXorSet.gen(iter, xor));
  return xor;
});

chain_(async function *appendObject(iter, obj, value) {
  for await (const item of iter) {
    if (item instanceof Array) { obj[item[0]] = item[1]; yield item; }
    else { obj[item] = value; yield [item, value]; }
  }
});

value_(async function toObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  await AsIt.exec(AsIt.appendObject.gen(iter, obj, value));
  return obj;
});

chain_(async function *defaultsObject(iter, obj, value) {
  for await (const item of iter) {
    if (item instanceof Array) {
      const key = item[0];
      if (!(key in obj)) obj[key] = item[1];
      yield item;
    } else {
      if (!(item in obj)) obj[item] = value;
      yield [item, value];
    }
  }
});

value_(async function toDefaultsObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  await AsIt.exec(AsIt.defaultsObject.gen(iter, obj, value));
  return obj;
});

chain_(async function *appendXorObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  for await (const item of iter) {
    if (item instanceof Array) {
      const key = item[0];
      if (key in obj) { delete obj[key]; yield false; }
      else { obj[key] = item[1]; yield true; }
    } else {
      if (item in obj) { delete obj[item]; yield false; }
      else { obj[item] = value; yield true; }
    }
  }
});

value_(async function toXorObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  await AsIt.exec(AsIt.appendXorObject.gen(iter, obj, value));
  return obj;
});

chain_(async function *appendMap(iter, map, value) {
  for await (const item of iter) {
    if (item instanceof Array) { map.set(item[0], item[1]); yield item; }
    else { map.set(item, value); yield [item, value]; }
  }
});

value_(async function toMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  await AsIt.exec(AsIt.appendMap.gen(iter, map, value));
  return map;
});

chain_(async function *defaultsMap(iter, map, value) {
  for await (const item of iter) {
    if (item instanceof Array) {
      const key = item[0];
      if (!map.has(key)) map.set(key, item[1]);
      yield item;
    } else {
      if (!map.has(item)) map.set(item, value);
      yield [item, value];
    }
  }
});

value_(async function toDefaultsMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  await AsIt.exec(AsIt.defaultsMap.gen(iter, map, value));
  return map;
});

chain_(async function *appendXorMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  for await (const item of iter) {
    if (item instanceof Array) {
      const key = item[0];
      if (map.has(key)) { map.delete(key); yield false; }
      else { map.set(key, item[1]); yield true; }
    } else {
      if (map.has(item)) { map.delete(item); yield false; }
      else { map.set(item, value); yield true; }
    }
  }
});

value_(async function toXorMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  await AsIt.exec(AsIt.appendXorMap.gen(iter, map, value));
  return map;
});

value_(async function count(iter) {
  let c = 0;
  for await (const item of iter) c++;
  return c;
});

value_(async function exec(iter) {
  for await (const item of iter);
});

value_(async function first(iter) {
  for await (const item of iter) return item;
});

value_(async function last(iter) {
  let last;
  for await (const item of iter) last = item;
  return last;
});

value_(async function toSum(iter, def, out) {
  if (typeof def === 'object') { out = def; def = null; }
  let n = 0;

  if (def == null) {
    const {value, done} = await iter.next();
    if (done) return def;
    def = value;
    n++;
  }

  for await (const item of iter) {
    def += item;
    n++;
  }

  if (out) {
    out.sum = def;
    out.count = n;
  }

  return def;
});

value_(function toAsIt(it) {
  return new AsIt(it);
});

value_(async function toIter(iter) {
  const arr = await AsIt.toArray(iter);
  return Iter.from(arr);
});

value_($.feedback);

module.exports = AsIt;
