// BP10-050 Creative Conjurer — Runecraft follower, 2, 2/3. アルカナ・魔法使い.
// {[fanfare]} Choose one. (1) Add 1 to a Stack on your field. (2) Earth Rite: Deal 2 damage to each
// enemy leader. ((1) with no Stack summons a Magic Sediment, CR 13.3.2.4; (2) can be chosen without
// Earth Rite, even with no Stack, and then does nothing — rulings, CR 13.3.3.2.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "stack",
          label: "(1) Add 1 to a Stack on your field",
          *resolve(fx) {
            yield* fx.addToStack(1);
          },
        },
        {
          id: "damage",
          label: "(2) Earth Rite: deal 2 damage to each enemy leader",
          earthRite: true,
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          },
        },
      ],
    }),
  ],
});
