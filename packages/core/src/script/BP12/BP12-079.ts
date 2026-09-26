// BP12-079 Garnet Waltz — Abysscraft spell, 1. 機械・魔界・吸血鬼.
// Choose one. (1) Deal 2 damage to each enemy leader and 1 damage to your own. (2) Summon an Assembly
// Droid token. Put an Assembly Droid token into your EX area. If there's a Mono, Garnet Rebel on your
// field, summon the second token instead. (Both leaders at 0: a draw; with Mono, 2 Droids are summoned —
// rulings.)
import { defineCard, spell } from "../helpers";
import { DROID, onYourField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "damage",
          label: "(1) 2 damage to each enemy leader, 1 to yours",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
          },
        },
        {
          id: "droids",
          label: "(2) An Assembly Droid onto the field and one into the EX area",
          *resolve(fx) {
            yield* fx.summon([DROID]);
            if (onYourField(fx.game, fx.controller, "Mono, Garnet Rebel")) yield* fx.summon([DROID]);
            else yield* fx.tokensToEx([DROID]);
          },
        },
      ],
    }),
  ],
});
