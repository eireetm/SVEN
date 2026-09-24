// BP05-085 Thundering Roar — Abysscraft spell, 2. 絶傑・死霊術師.
// Choose one of the following. Necrocharge (10): Choose up to 2 instead. (1) Each opponent discards
// a random card. (2) Select an enemy follower on the field and deal it 3 damage.
// (CR 5.18.3.1.1 / 13.5.1: the number is fixed when it is played.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, c) => (g.necrocharge(c, 10) ? 2 : 1),
      modes: [
        {
          id: "discard",
          label: "Each opponent discards a random card",
          *resolve(fx) {
            yield* fx.discardRandom(1, fx.game.opponent(fx.controller));
          },
        },
        {
          id: "damage",
          label: "Deal 3 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
      ],
    }),
  ],
});
