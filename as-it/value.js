const {Readable} = require('stream');
const AsIt = require('./base');
const Iter = require('../iter');
const $ = require('../func');

AsIt.chain_(async function *appendArray(iter, to) {
  for await (const item of iter) {
    to.push(item);
    yield item;
  }
});

AsIt.value_(async function toArray(iter, to) {
  if (!to) to = [];
  await AsIt.exec(AsIt.appendArray.gen(iter, to));
  return to;
});

AsIt.chain_(async function *prependArray(iter, to) {
  for await (const item of iter) {
    to.unshift(item);
    yield item;
  }
});

AsIt.value_(async function toPrependArray(iter, to) {
  if (!to) to = [];
  await AsIt.exec(AsIt.prependArray.gen(iter, to));
  return to;
});

AsIt.chain_(async function *appendSet(iter, to) {
  for await (const item of iter) {
    to.add(item);
    yield item;
  }
});

AsIt.chain_(async function *unset(iter, to) {
  for await (const item of iter) {
    to.delete(item);
    yield item;
  }
});

AsIt.chain_(async function *omit(iter, to) {
  for await (let item of iter) {
    yield item;
    if (item instanceof Array) item = item[0];
    delete to[item];
  }
});

AsIt.value_(async function toSet(iter, to) {
  if (!to) to = new Set();
  await AsIt.exec(AsIt.appendSet.gen(iter, to));
  return to;
});

AsIt.chain_(async function *appendXorSet(iter, xor) {
  if (!xor) xor = new Set();

  for await (const key of iter) {
    if (xor.has(key)) { xor.delete(key); yield false; }
    else { xor.add(key); yield true; }
  }
});

AsIt.value_(async function toXorSet(iter, xor) {
  if (!xor) xor = new Set();
  await AsIt.exec(AsIt.appendXorSet.gen(iter, xor));
  return xor;
});

AsIt.chain_(async function *appendObject(iter, obj, value) {
  for await (const item of iter) {
    if (item instanceof Array) { if (obj) obj[item[0]] = item[1]; yield item; }
    else if (typeof item === 'object') { if (obj) Object.assign(obj, item); yield* Iter.objectEntries.gen(item); }
    else { if (obj) obj[item] = value; yield [item, value]; }
  }
});

AsIt.value_(async function toObject(iter, obj, value) {
  if (typeof obj !== 'object') {
    value = obj;
    obj = Object.create(null);
  } else if (!obj) obj = Object.create(null);

  await AsIt.exec(AsIt.appendObject.gen(iter, obj, value));
  return obj;
});

AsIt.chain_(async function *defaultsObject(iter, obj, value) {
  for await (const item of iter) {
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

AsIt.value_(async function toDefaultsObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  await AsIt.exec(AsIt.defaultsObject.gen(iter, obj, value));
  return obj;
});

AsIt.chain_(async function *appendXorObject(iter, obj, value) {
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

AsIt.value_(async function toXorObject(iter, obj, value) {
  if (typeof obj !== 'object') { value = obj; obj = Object.create(null); }
  else if (!obj) obj = Object.create(null);

  await AsIt.exec(AsIt.appendXorObject.gen(iter, obj, value));
  return obj;
});

AsIt.chain_(async function *appendMap(iter, map, value) {
  for await (const item of iter) {
    if (item instanceof Array) { map.set(item[0], item[1]); yield item; }
    else { map.set(item, value); yield [item, value]; }
  }
});

AsIt.value_(async function toMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  await AsIt.exec(AsIt.appendMap.gen(iter, map, value));
  return map;
});

AsIt.chain_(async function *defaultsMap(iter, map, value) {
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

AsIt.value_(async function toDefaultsMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  await AsIt.exec(AsIt.defaultsMap.gen(iter, map, value));
  return map;
});

AsIt.chain_(async function *appendXorMap(iter, map, value) {
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

AsIt.value_(async function toXorMap(iter, map, value) {
  if (!(map instanceof Map)) { value = map; map = new Map(); }

  await AsIt.exec(AsIt.appendXorMap.gen(iter, map, value));
  return map;
});

AsIt.value_(async function count(iter) {
  let c = 0;
  for await (const item of iter) ++c;
  return c;
});

AsIt.chain_(async function* countTo(iter, to, field = 'count') {
  for await (const item of iter) {
    yield item;
    ++to[field];
  }
});

AsIt.value_(async function exec(iter) {
  for await (const item of iter);
});

AsIt.value_(async function first(iter) {
  for await (const item of iter) return item;
});

AsIt.value_(async function last(iter) {
  let last;
  for await (const item of iter) last = item;
  return last;
});

AsIt.chain_(async function* reduceTo(iter, func, def, out) {
  const desc = {iter, ctx: this};
  let n = 0;

  if (def == null) {
    const {value, done} = await iter.next();
    if (done) return def;
    def = value;
    n++;
  }

  if (func) {
    for await (const item of iter) { def = await func.call(this, def, item, n, desc); n++; yield item; }
  } else {
    for await (const item of iter) { def += item; n++; yield item; }
  }

  if (out) {
    out.count = n;
    out.result = def;
  }
});

AsIt.value_(async function reduce(iter, func, def, out = {}) {
  const it = AsIt.reduceTo.gen.call(this, iter, func, def, out);
  for await (const item of it);
  return out.result;
});

AsIt.value_(function stream(iter, to, opts = {}) {
  const read = Readable.from(iter);
  if (to) read.pipe(to, opts);
  opts.stream = read;
  return to || read;
});

AsIt.value_(function streams(iter, to, opts = {}) {
  if (!('end' in opts)) opts.end = false;
  return AsIt.stream(iter, to, opts);
});

AsIt.chain_(function pipe(iter, to, opts) {
  const stream = AsIt.stream.call(this, iter, to, opts);
  return stream;
});

AsIt.chain_(function pipes(iter, to, opts) {
  const stream = AsIt.streams.call(this, iter, to, opts);
  return stream;
});

AsIt.value_(function toAsIt(it) {
  return new AsIt(it);
});

AsIt.value_(async function toIter(iter) {
  const arr = await AsIt.toArray(iter);
  return Iter.from(arr);
});

AsIt.value_($.feedback);

AsIt.value_(function to(iter, Class, ...args) {
  const inst = new Class(iter, ...args);
  return inst;
});

const appendResultFuncs = new Map([
  [Object, AsIt.appendObject.gen],
  [Array, AsIt.appendArray.gen],
  [Set, AsIt.appendSet.gen],
  [Map, AsIt.appendMap.gen],
]);

AsIt.chain_(function appendResult(iter, to, ...args) {
  return (appendResultFuncs.get($.getClass(to)) || AsIt.appendObject.gen).call(this, iter, to, ...args);
});

const toResultFuncs = new Map([
  [Object, AsIt.toObject],
  [Array, AsIt.toArray],
  [Set, AsIt.toSet],
  [Map, AsIt.toMap],
]);

AsIt.value_(function toResult(iter, to, ...args) {
  return (toResultFuncs.get($.getClass(to)) || AsIt.toObject).call(this, iter, to, ...args);
});

module.exports = AsIt;
