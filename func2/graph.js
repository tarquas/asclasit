const $ = require('./cache');
const Iter = require('../iter');

class Graph {
  tadj = new Map();

  constructor({cacheDests = 10} = {}) {
    this.dests = $.cache_(cacheDests, this.cacheDests.bind(this));
  }

  lessDist({froms, walk, cur: {step: via, dist: vdist, count: vcount}}, [step, sdist]) {
    const dist = sdist + vdist;
    let from = froms.get(step);

    if (!from) {
      froms.set(step, from = $());
    } else if (dist >= from.dist) return;

    const count = vcount + 1;
    from.dist = dist;
    from.via = via;
    from.count = count;
    walk.push({step, dist, count});
  }

  cacheDests(to) {
    const froms = new Map();
    const used = new Set();

    const isNotUsed = ([step]) => !used.has(step);
    const maxDist = (a, b) => b.dist - a.dist;

    const walk = $.PQ.from([{step: to, dist: 0, count: 0}], {revSort: maxDist});
    const arg = {froms, walk, cur: null};
    const lessDist = this.lessDist.bind(this, arg);

    while ((arg.cur = walk.pop()) && !used.has(arg.cur.step)) {
      const node = this.tadj.get(arg.cur.step);
      if (!node) continue;
      new Iter(node).filter(isNotUsed).call(lessDist).exec();
      used.add(arg.cur.step);
    }

    return froms;
  }

  link(v1, v2, w) {
    if (!Number.isFinite(w) || w < 0) w = 1;
    this.dests.dropCache();
    let node = this.tadj.get(v2);
    if (node == null) this.tadj.set(v2, node = new Map());
    node.set(v1, w);
  }

  unlink(v1, v2) {
    const node = this.tadj.get(v2);
    if (node == null) return;
    node.delete(v1);
    this.dests.dropCache();
    if (!node.size) this.tadj.delete(v2);
  }

  link2(v1, v2, w) {
    this.link(v2, v1, w);
    this.link(v1, v2, w);
  }

  unlink2(v1, v2) {
    this.unlink(v2, v1);
    this.unlink(v1, v2);
  }

  *path(from, to) {
    if (from !== to) {
      const froms = this.dests(to);

      while (from !== to) {
        const route = froms.get(from);
        if (!route) return;
        yield {from, ...route};
        from = route.via;
      }
    }

    yield {from, dist: 0, count: 0};
  }

  pathOn(from, to) {
    return new Iter(this.path(from, to)).map('from');
  }

  _pathStatItem({first: prev, second: cur}) {
    if (!cur) return {at: prev.from, dist: this.dist, count: this.count};
    const length = prev.dist - cur.dist;

    const res = {
      at: prev.from, next: cur.from, length,
      dist: this.dist, count: this.count,
      toDist: prev.dist, toCount: prev.count
    };

    this.dist += length;
    this.count++;
    return res;
  }

  pathStat(from, to) {
    const iter = Iter.concat(this.path(from, to), [null]).map($.window_(2)).skip(1).map(this._pathStatItem);
    iter.count = 0;
    iter.dist = 0;
    return iter;
  }

  shortest(from, to) {
    const froms = this.dests(to);
    const route = froms.get(from);
    return route;
  }

  shortestDist(from, to) {
    const route = this.shortest(from, to);
    return route ? route.dist : Infinity;
  }

  shortestSteps(from, to) {
    const route = this.shortest(from, to);
    return route ? route.count : Infinity;
  }
}

$.Graph = Graph;

module.exports = $;
