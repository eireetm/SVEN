// BP05-078 Wings of Lust — Abysscraft spell, 1. 絶傑・魔界.
// Choose up to 2 of the following. (1) Select a follower on your field. Give it Rush and deal 1
// damage to your leader. (2) Select an enemy follower on the field. Deal 2 damage to it and 1
// damage to your leader. (3) Deal 1 damage to your leader. Draw a card. Discard a card.
// Rulings: an option needing a follower can't be chosen without one; each 1 damage to your leader
// counts as a separate loss of defense.
import { defineCard, spell } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modeCount: () => 2,
      modes: [
        {
          id: "rush",
          label: "Give a follower on your field Rush",
          targets: [yourFollower()],
          *resolve(fx) {
            yield* fx.giveKeyword(fx.targets[0]![0]!, "rush");
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
          },
        },
        {
          id: "damage",
          label: "Deal 2 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
          },
        },
        {
          id: "draw",
          label: "Draw a card, then discard a card",
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
            yield* fx.draw(1);
            yield* fx.discard(fx.controller, 1, 1);
          },
        },
      ],
    }),
  ],
});
