const $ = require('../func');
const Iter = require('../iter');
const AsIt = require('../as-it');

const {func_} = $;

function dropCache() {
  this.cache.map = null;
}

function getFromCache(func, value) {
  const at = func.cache.map;

  if (at.has(value)) {
    const res = at.get(value);
    at.delete(value);
    at.set(value, res);
    return {res};
  }
}

function checkOver(func) {
  const {cache} = func;
  const over = cache.map.size - cache.size;
  if (over > 0) Iter.keys(cache.map).take(over).unset(cache.map).exec();
}

function getCacheFunc(mapper, desc) {
  let func;

  if (mapper.constructor === $.AsyncFunction) {
    func = async function _cache(value) {
      const {cache} = func;

      if (cache.map) {
        const cached = getFromCache(func, value);
        if (cached) return cached.res;
      } else cache.map = new Map();

      const mapped = await mapper.call(this, value, value, desc);
      cache.map.set(value, mapped);
      checkOver(func);
      return mapped;
    };
  } else {
    func = function _cache(value) {
      const {cache} = func;

      if (cache.map) {
        const cached = getFromCache(func, value);
        if (cached) return cached.res;
      } else cache.map = new Map();

      const mapped = mapper.call(this, value, value, desc);
      cache.map.set(value, mapped);
      checkOver(func);
      return mapped;
    };
  }

  return func;
}

$.defaultCacheSize = 200;

func_(function cache_(size, mapper) {
  if (typeof mapper !== 'function') throw new TypeError('mapper is not function');
  if (!Number.isFinite(size) || size <= 0) size = $.defaultCacheSize;
  const desc = {ctx: this};
  const func = getCacheFunc(mapper, desc);
  func.cache = {size, map: null};
  func.cacheMapper = mapper;
  func.dropCache = dropCache;
  func.toChunkCache = toChunkCache;
  return func;
});

function getChunkFromCache(func, chunk) {
  const {cache, type} = func;
  const isArray = type === Array;
  let res, toOut;

  if (!cache.map) cache.map = new Map();

  const need = new Map();
  const iter = Iter.entries(chunk instanceof Array ? Iter.getIter(chunk) : chunk);

  if (isArray) {
    iter.mapKey($.counter_(0));
    res = chunk instanceof Array ? Array(chunk.length) : [];
    toOut = Iter.toObject;
  } else {
    res = ($.accInit.get(type) || $)();
    toOut = Iter.toResult;
  }

  for (const [key, value] of iter) {
    const cached = getFromCache(func, value);
    if (cached) toOut([[key, cached.res]], res);
    else $.defMap(need, value, Set).add(key);
  }

  return {res, need};
}

function getChunkCacheFunc(mapper, desc) {
  let func;

  if (mapper.constructor === $.AsyncFunction) {
    func = async function _cacheChunk(chunk) {
      const {res, need} = getChunkFromCache(func, chunk);
      if (!need.size) return res;
      const {cache} = func;
      const mapped = await mapper.call(this, need.keys(), chunk, desc);
      const iter = Iter.from(need).mapKey(mapped).maps(([k, v]) => Iter.entries(v).mapValue($._(k)));
      if (func.type === Array) iter.toObject(res); else iter.toResult(res);
      Iter.from(mapped).toMap(cache.map);
      checkOver(func);
      return res;
    };
  } else {
    func = function _cacheChunk(chunk) {
      const {res, need} = getChunkFromCache(func, chunk);
      if (!need.size) return res;
      const {cache} = func;
      const mapped = mapper.call(this, need.keys(), chunk, desc);
      const iter = Iter.from(need).mapKey(mapped).maps(([k, v]) => Iter.entries(v).mapValue($._(k)));
      if (func.type === Array) iter.toObject(res); else iter.toResult(res);
      Iter.from(mapped).toMap(cache.map);
      checkOver(func);
      return res;
    };
  }

  return func;
}

function emulMapper(mapper) {
  if (mapper.constructor === $.AsyncFunction) {
    return async (value) => {
      const map = await mapper.call(this, new Set([value]));
      if (map instanceof Map) return map.get(value);
      return map[value];
    }
  } else {
    return (value) => {
      const map = mapper.call(this, new Set([value]));
      if (map instanceof Map) return map.get(value);
      return map[value];
    }
  }
}

function toCache(mapper, ctx) {
  if (!mapper) mapper = emulMapper(this.cacheMapper);
  const func = getCacheFunc(mapper, {ctx});
  func.cache = this.cache;
  func.dropCache = dropCache;
  return func;
}

function emulChunkMapper(mapper) {
  if (mapper.constructor === $.AsyncFunction) {
    return async chunk => await AsIt.from(chunk).map(2).mapValue(mapper).toMap();
  } else {
    return chunk => Iter.from(chunk).map(2).mapValue(mapper).toMap();
  }
}

function toChunkCache(type, mapper, ctx) {
  if (!mapper) mapper = emulChunkMapper(this.cacheMapper);
  const func = getChunkCacheFunc(mapper, {ctx});
  func.type = type;
  func.cache = this.cache;
  func.dropCache = dropCache;
  return func;
}

func_(function cacheChunk_(size, mapper, type) {
  if (typeof mapper !== 'function') throw new TypeError('mapper is not function');
  if (!Number.isFinite(size) || size <= 0) size = $.defaultCacheSize;
  const desc = {ctx: this};
  const func = getChunkCacheFunc(mapper, desc);
  func.type = type;
  func.cache = {size, map: null};
  func.cacheMapper = mapper;
  func.dropCache = dropCache;
  func.toCache = toCache;
  return func;
});

module.exports = $;
