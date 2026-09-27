// DSD01a-003 Grea, Mysterian Dragoness (Evolved) — 4/4.
// If an Academic spell you control would deal damage, it deals that much plus 1 instead. (Two of these: +2; each damage of a spell
// gets +1, after the spell's own changes — rulings, CR 10.10.)
// On Evolve - Search your deck for a Grea's Ember, put it into your EX area, then shuffle. The next Grea's Ember you play this turn
// costs 1 less. (Also when none is found, and when it is played from outside the hand — rulings.)
import { defineCard, onEvolve } from "../helpers";
import { isSpell, named } from "../targets";
import { GREAS_EMBER, academic } from "./shared";

export default defineCard({
  nextPlay: { greasEmber: (g, card) => named(GREAS_EMBER)(g, card) },
  field: {
    damageBy: (g, self, damage) =>
      damage.source !== null &&
      damage.kind === "ability" &&
      g.card(damage.source) !== undefined &&
      g.controller(damage.source) === g.controller(self) &&
      isSpell(g, damage.source) &&
      academic(g, damage.source)
        ? 1
        : 0,
  },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named(GREAS_EMBER)(fx.game, id), { to: "ex" });
        yield* fx.nextPlayCostsLess("greasEmber", 1);
      },
    }),
  ],
});
