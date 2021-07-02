const {Readable} = require('stream');
const Iter = require('./base');
const $ = require('../func');

Iter.chain_(function *appendArray(iter, to) {
  for (const item of iter) {
    to.push(item);
    yield item;
  }
});

Iter.value_(function toArray(iter, to) {
  if (to) {
    for (const item of iter) to.push(item);
    return to;
  }

  return Array.from(iter);
});

Iter.chain_(function *prependArray(iter, to) {
  for (const item of iter) {
    to.unshift(item);
    yield item;
  }
});

Iter.value_(function toPrependArray(iter, to) {
  if (!to) to = [];
  Iter.exec(Iter.prependArray.gen(iter, to));
  return to;
});

Iter.chain_(function *appendSet(iter, to) {
  for (const item of iter) {
    to.add(item);
    yield item;
  }
});

Iter.value_(function toSet(iter, to) {
  if (to) {
    for (const item of iter) to.add(item);
    return to;
  }

  return new Set(iter);
});

Iter.chain_(function *appendXorSet(iter, xor) {
  if (!xor) xor = new Set();

  for (const key of iter) {
    if (xor.has(key)) { xor.delete(key); yield false; }
    else { xor.add(key); yield true; }
  }
});

Iter.value_(function toXorSet(iter, xor) {
  if (!xor) xor = new Set();
  Iter.exec(Iter.appendXorSet.gen(iter, xor));
  return xor;
});

Iter.chain_(function *appendObject(iter, obj, value) {
  for (const item of iter) {
    if (item instanceof Array) { if (obj) obj[item[0]] = item[1]; yield item; }
    else if (typeof item === 'object') { if (obj) Object.assign(obj, item); yield* Iter.objectEntries.gen(item); }
    else { if (obj) obj[item] = value; yield [item, value]; }
  }
});

Iter.value_(function toObject(iter, obj, value) {
  if (typeof obj !== 'object') {
    value = obj; obj = Object.create(null);
  } else if (!obj) obj = Object.create(null);

  Iter.exec(Iter.appendObject.gen(iter, obj, value));
  return obj;
});

Iter.chain_(function *appendXorObject(iter, obj, value) {
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

Iter.value_(function toXorObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  Iter.exec(Iter.appendXorObject.gen(iter, obj, value));
  return obj;
});

Iter.chain_(function *defaultsObject(iter, obj, value) {
  for (const item of iter) {
    if (item instanceof Array) {
      const key = item[0];
      if (obj && !(key in obj)) obj[key] = item[1];
      yield item;
    } else if (typeof item === 'object') {
      const ents = Iter.objectEntries.gen(item);
      if (!obj) yield* ents;
      else for (const [k, v] of ents) {
        if (!(k in obj)) obj[k] = v;
        yield [k, v];
      }
    } else {
      if (obj && !(item in obj)) obj[item] = value;
      yield [item, value];
    }
  }
});

Iter.value_(function toDefaultsObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  Iter.exec(Iter.defaultsObject.gen(iter, obj, value));
  return obj;
});

Iter.chain_(function *appendMap(iter, map, value) {
  for (const item of iter) {
    if (item instanceof Array) { map.set(item[0], item[1]); yield item; }
    else { map.set(item, value); yield [item, value]; }
  }
});

Iter.value_(function toMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  Iter.exec(Iter.appendMap.gen(iter, map, value));
  return map;
});

Iter.chain_(function *defaultsMap(iter, map, value) {
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

Iter.value_(function toDefaultsMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  Iter.exec(Iter.defaultsMap.gen(iter, map, value));
  return map;
});

Iter.chain_(function *appendXorMap(iter, map, value) {
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

Iter.value_(function toXorMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  Iter.exec(Iter.appendXorMap.gen(iter, map, value));
  return map;
});

Iter.value_(function count(iter) {
  let c = 0;
  for (const item of iter) c++;
  return c;
});

Iter.value_(function exec(iter) {
  for (const item of iter);
});

Iter.value_(function first(iter) {
  for (const item of iter) return item;
});

Iter.value_(function last(iter) {
  let last;
  for (const item of iter) last = item;
  return last;
});

Iter.chain_(function* reduceTo(iter, func, def, out) {
  const desc = {iter, ctx: this};
  let n = 0;

  if (def == null) {
    const {value, done} = iter.next();
    if (done) return def;
    def = value;
    n++;
  }

  if (func) {
    for (const item of iter) { def = func.call(this, def, item, n, desc); n++; yield item; }
  } else {
    for (const item of iter) { def += item; n++; yield item; }
  }

  if (out) {
    out.count = n;
    out.result = def;
  }
});

Iter.value_(function reduce(iter, func, def, out = {}) {
  const it = Iter.reduceTo.gen(iter, func, def, out);
  for (const item of it);
  return out.result;
});

Iter.value_(function stream(iter, to, opts = {}) {
  const read = Readable.from(iter);
  if (to) read.pipe(to, opts);
  opts.stream = read;
  return to || read;
});

Iter.value_(function streams(iter, to, opts = {}) {
  if (!('end' in opts)) opts.end = false;
  return Iter.stream.call(this, iter, to, opts);
});

Iter.value_(function toIter(it) {
  return new Iter(it);
});

Iter.value_($.feedback);

Iter.value_(function to(iter, Class, ...args) {
  const inst = new Class(iter, ...args);
  return inst;
});

module.exports = Iter;
