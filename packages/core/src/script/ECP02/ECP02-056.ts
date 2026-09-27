// ECP02-056 Natsuki Kimura [Scarlet Love Song] (Evolved) — 4/4.
// While there are at least 10 Passion cards in your cemetery, this has Storm. (A passive ability — ruling.)
// On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number of Passion followers on your
// field.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { followersOnYourField, passion } from "./shared";

export default defineCard({
  field: {
    // typeAndTraits (not info) inside the keyword passive.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const n = g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("パッション")).length;
      return n >= 10 ? ["storm"] : [];
    },
  },
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * followersOnYourField(fx.game, fx.controller, passion));
      },
    }),
  ],
});
