const Iter = require('./base');

Iter.make_(function* objectKeys(obj) {
  if (obj == null) return;

  for (const key in obj) if (Object.hasOwnProperty.call(obj, key)) {
    yield key;
  }
});

Iter.make_(function* objectEntries(obj) {
  if (obj == null) return;

  for (const key in obj) if (Object.hasOwnProperty.call(obj, key)) {
    yield [key, obj[key]];
  }
});

Iter.make_(function* objectValues(obj) {
  for (const [, value] of Iter.objectEntries(obj)) yield value;
});

Iter.make_(function* objectsKeys(...objs) {
  for (const obj of objs) yield* Iter.objectKeys.gen(obj);
});

Iter.make_(function* objectsEntries(...objs) {
  for (const obj of objs) yield* Iter.objectEntries.gen(obj);
});

Iter.make_(function* objectsValues(...objs) {
  for (const obj of objs) yield* Iter.objectValues.gen(obj);
});

Iter.builtinEntries = new Set([Array, Set, Map]);

Iter.chain_(function* keys(...objs) {
  for (let obj of objs) {
    while (typeof obj === 'function') obj = obj.call(this);
    if (obj == null) continue;

    if (typeof obj !== 'object') {
      yield obj;
      continue;
    }

    if (Iter.builtinEntries.has(obj.constructor)) {
      yield* obj.keys();
      continue;
    }

    const iter = Iter.getIter(obj);

    if (iter) {
      for (const item of iter) {
        if (item instanceof Array) yield item[0]; else yield item;
      }
    } else {
      yield* Iter.objectKeys.gen(obj);
    }
  }
});

Iter.chain_(function* entries(...objs) {
  for (let obj of objs) {
    while (typeof obj === 'function') obj = obj.call(this);
    if (obj == null) continue;

    if (typeof obj !== 'object') {
      yield [obj, obj];
      continue;
    }

    if (Iter.builtinEntries.has(obj.constructor)) {
      yield* obj.entries();
      continue;
    }

    const iter = Iter.getIter(obj);

    if (iter) {
      for (const item of iter) {
        if (item instanceof Array) yield item; else yield [item, item];
      }
    } else {
      yield* Iter.objectEntries.gen(obj);
    }
  }
});

Iter.chain_(function* values(...objs) {
  for (let obj of objs) {
    while (typeof obj === 'function') obj = obj.call(this);
    if (obj == null) continue;

    if (typeof obj !== 'object') {
      yield obj;
      continue;
    }

    if (Iter.builtinEntries.has(obj.constructor)) {
      yield* obj.values();
      continue;
    }

    const iter = Iter.getIter(obj);

    if (iter) {
      for (const item of iter) {
        if (item instanceof Array) yield item[1]; else yield item;
      }
    } else {
      yield* Iter.objectValues.gen(obj);
    }
  }
});

module.exports = Iter;
