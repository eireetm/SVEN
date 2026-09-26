// BP18-081 Vania, Crimson Majesty (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
// On Super-Evolve - Give this "Each Forest Bat on your field has Storm and Bane." (A gained passive: EffectChange
// "gainedText", CR 10.9.1.2; super-evolving triggers both, in either order — rulings.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { FOREST_BAT } from "./shared";

const BATS = "Each Forest Bat on your field has Storm and Bane.";

export default defineCard({
  field: {
    // keywordsFor: namesOf (not info) for the other cards.
    keywordsFor: (g, self, card) => {
      if (!g.hasGainedText(self, BATS)) return [];
      const c = g.card(card);
      if (c?.zone !== "field" || c.controller !== g.card(self)!.controller) return [];
      return g.typeAndTraits(card).type === "follower" && g.namesOf(card).includes(FOREST_BAT) ? ["storm", "bane"] : [];
    },
  },
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.gainText(fx.self, BATS);
      },
    }),
  ],
});
