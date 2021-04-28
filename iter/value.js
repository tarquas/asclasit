const Iter = require('./base');
const $ = require('../func');

const {value_, chain_} = Iter;

chain_(function *appendArray(iter, to) {
  for (const item of iter) {
    to.push(item);
    yield item;
  }
});

value_(function toArray(iter, to) {
  if (to) {
    for (const item of iter) to.push(item);
    return to;
  }

  return Array.from(iter);
});

chain_(function *prependArray(iter, to) {
  for (const item of iter) {
    to.unshift(item);
    yield item;
  }
});

value_(function toPrependArray(iter, to) {
  if (!to) to = [];
  Iter.exec(Iter.prependArray.gen(iter, to));
  return to;
});

chain_(function *appendSet(iter, to) {
  for (const item of iter) {
    to.add(item);
    yield item;
  }
});

value_(function toSet(iter, to) {
  if (to) {
    for (const item of iter) to.add(item);
    return to;
  }

  return new Set(iter);
});

chain_(function *appendXorSet(iter, xor) {
  if (!xor) xor = new Set();

  for (const key of iter) {
    if (xor.has(key)) { xor.delete(key); yield false; }
    else { xor.add(key); yield true; }
  }
});

value_(function toXorSet(iter, xor) {
  if (!xor) xor = new Set();
  Iter.exec(Iter.appendXorSet.gen(iter, xor));
  return xor;
});

chain_(function *appendObject(iter, obj, value) {
  for (const item of iter) {
    if (item instanceof Array) { obj[item[0]] = item[1]; yield item; }
    else { obj[item] = value; yield [item, value]; }
  }
});

value_(function toObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  Iter.exec(Iter.appendObject.gen(iter, obj, value));
  return obj;
});

chain_(function *appendXorObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  for (const item of iter) {
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

value_(function toXorObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  Iter.exec(Iter.appendXorObject.gen(iter, obj, value));
  return obj;
});

chain_(function *defaultsObject(iter, obj, value) {
  for (const item of iter) {
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

value_(function toDefaultsObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  Iter.exec(Iter.defaultsObject.gen(iter, obj, value));
  return obj;
});

chain_(function *appendMap(iter, map, value) {
  for (const item of iter) {
    if (item instanceof Array) { map.set(item[0], item[1]); yield item; }
    else { map.set(item, value); yield [item, value]; }
  }
});

value_(function toMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  Iter.exec(Iter.appendMap.gen(iter, map, value));
  return map;
});

chain_(function *defaultsMap(iter, map, value) {
  for (const item of iter) {
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

value_(function toDefaultsMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  Iter.exec(Iter.defaultsMap.gen(iter, map, value));
  return map;
});

chain_(function *appendXorMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  for (const item of iter) {
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

value_(function toXorMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  Iter.exec(Iter.appendXorMap.gen(iter, map, value));
  return map;
});

value_(function count(iter) {
  let c = 0;
  for (const item of iter) c++;
  return c;
});

value_(function exec(iter) {
  for (const item of iter);
});

value_(function first(iter) {
  for (const item of iter) return item;
});

value_(function last(iter) {
  let last;
  for (const item of iter) last = item;
  return last;
});

value_(function toSum(iter, def, out) {
  if (typeof def === 'object') { out = def; def = null; }
  let n = 0;

  if (def == null) {
    const {value, done} = iter.next();
    if (done) return def;
    def = value;
    n++;
  }

  for (const item of iter) {
    def += item;
    n++;
  }

  if (out) {
    out.sum = def;
    out.count = n;
  }

  return def;
});

value_(function toIter(it) {
  return new Iter(it);
});

value_($.feedback);

module.exports = Iter;
