const Iter = require('../iter');
const AsIt = require('./base');

AsIt.make_(Iter.objectKeys.gen);

AsIt.make_(Iter.objectEntries.gen);

AsIt.make_(Iter.objectValues.gen);

AsIt.make_(Iter.objectsKeys.gen);

AsIt.make_(Iter.objectsEntries.gen);

AsIt.make_(Iter.objectsValues.gen);

AsIt.builtinEntries = Iter.builtinEntries;

AsIt.make_(async function* keys(...objs) {
  for (let obj of objs) {
    while (typeof obj === 'function') obj = await obj.call(this);
    if (obj == null) continue;

    if (typeof obj !== 'object') {
      yield obj;
      continue;
    }

    if (AsIt.builtinEntries.has(obj.constructor)) {
      yield* obj.keys();
      continue;
    }

    const iter = AsIt.getIter(obj);

    if (iter) {
      for await (const item of iter) {
        if (item instanceof Array) yield item[0]; else yield item;
      }
    } else {
      yield* AsIt.objectKeys.gen(obj);
    }
  }
});

AsIt.make_(async function* entries(...objs) {
  for (let obj of objs) {
    while (typeof obj === 'function') obj = await obj.call(this);
    if (obj == null) continue;

    if (typeof obj !== 'object') {
      yield [obj, obj];
      continue;
    }

    if (AsIt.builtinEntries.has(obj.constructor)) {
      yield* obj.entries();
      continue;
    }

    const iter = AsIt.getIter(obj);

    if (iter) {
      for await (const item of iter) {
        if (item instanceof Array) yield item; else yield [item, item];
      }
    } else {
      yield* AsIt.objectEntries.gen(obj);
    }
  }
});

AsIt.make_(async function* values(...objs) {
  for (let obj of objs) {
    while (typeof obj === 'function') obj = await obj.call(this);
    if (obj == null) continue;

    if (typeof obj !== 'object') {
      yield obj;
      continue;
    }

    if (AsIt.builtinEntries.has(obj.constructor)) {
      yield* obj.values();
      continue;
    }

    const iter = AsIt.getIter(obj);

    if (iter) {
      for await (const item of iter) {
        if (item instanceof Array) yield item[1]; else yield item;
      }
    } else {
      yield* AsIt.objectValues.gen(obj);
    }
  }
});

module.exports = AsIt;
