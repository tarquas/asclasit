const Design = {
  rxItMethodTemplates: {
    make: /^\$([^_].*)_$/,
    chain: /^\$_(.+)_$/,
    value: /^\$_(.*[^_])$/,
  },

  $itApply() {
    const {$, $_} = this;
    if (Object.hasOwnProperty.call($_, '$itApplied')) return;

    const {make, chain, value} = Design.rxItMethodTemplates;
    const names = Object.getOwnPropertyNames($_);

    for (const name of names) {
      const chainEnts = name.match(chain);
      if (chainEnts) { $.chain_($_[name], chainEnts[1]); continue; }

      const valueEnts = name.match(value);
      if (valueEnts) { $.value_($_[name], valueEnts[1]); continue; }

      const makeEnts = name.match(make);
      if (makeEnts) { $.make_($_[name], makeEnts[1]); }
    }

    $_.$itApplied = true;
  },
};

module.exports = Design;
