const $clApplied = Symbol('$clApplied');
const $itApplied = Symbol('$itApplied');

const Design = {
  $classApply(clas) {
    Object.defineProperties(clas, {
      $: { get() { return this; } },
      $$: { get() { return this.prototype; } },
      $_: { get() { return Object.getPrototypeOf(this); } },
    });

    Object.defineProperties(clas.prototype, {
      $: { get() { return this.constructor; } },
      $$: { get() { return this.constructor.prototype; } },
      $_: { get() { return Object.getPrototypeOf(this); } },
    });
  },

  rxItMethodTemplates: {
    make: /^\$([^_].*)_$/,
    chain: /^\$_(.+)_$/,
    value: /^\$_(.*[^_])$/,
  },

  rxClMethodTemplate: /^\$_(.*[^_])$/,

  $instApply(inst) {
    const {from} = inst;
    const {$$} = from;
    const {rxClMethodTemplate} = Design;

    for (let o = $$; o; o = o.$_) {
      if (Object.hasOwnProperty.call(o, $clApplied)) break;
      const names = Object.getOwnPropertyNames(o);

      for (const name of names) {
        const ents = name.match(rxClMethodTemplate);
        if (ents) inst.method_(o, name, ents[1]);
      }

      Object.defineProperty(o, $clApplied, {value: true});
    }
  },

  $itApply(inst) {
    const {$} = inst;

    const {make, chain, value} = Design.rxItMethodTemplates;

    for (let o = $; o; o = o.$_) {
      const {$$} = o;
      if (!$$ || Object.hasOwnProperty.call($$, $itApplied)) break;
      const names = Object.getOwnPropertyNames($$);

      for (const name of names) {
        const chainEnts = name.match(chain);
        if (chainEnts) { o.chain_($$[name], chainEnts[1]); continue; }

        const valueEnts = name.match(value);
        if (valueEnts) { o.value_($$[name], valueEnts[1]); continue; }

        const makeEnts = name.match(make);
        if (makeEnts) { o.make_($$[name], makeEnts[1]); }
      }

      Object.defineProperty($$, $itApplied, {value: true});
    }
  },
};

module.exports = Design;
