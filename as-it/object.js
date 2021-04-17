const Iter = require('../iter');
const AsIt = require('./base');
const {make_} = AsIt;

make_(Iter.objectKeys.gen);

make_(Iter.objectEntries.gen);

make_(Iter.objectValues.gen);

make_(Iter.objectsKeys.gen);

make_(Iter.objectsEntries.gen);

make_(Iter.objectsValues.gen);

AsIt.builtinEntries = Iter.builtinEntries;

make_(async function* keys(...objs) {
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

make_(async function* entries(...objs) {
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

make_(async function* values(...objs) {
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
