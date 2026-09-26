// BP19-090 Howling Scream — Abysscraft spell, 0. 獣.
// Choose up to 2. (1) {[cost01]}: Select an enemy follower on the field and deal it 2 damage. Deal 1 damage to your leader.
// (2) {[cost01]}: Deal 1 damage to your leader. Draw a card. (At least 1, each once; an option's cost may be left unpaid and
// then it does nothing; (1) needs its target — rulings; CR 10.4.7.5.)
import { playPointsCost } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modeCount: () => 2,
      modes: [
        {
          id: "damage",
          label: "(1) (1): 2 damage to an enemy follower, 1 to your leader",
          cost: playPointsCost(1),
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
          },
        },
        {
          id: "draw",
          label: "(2) (1): 1 damage to your leader, draw a card",
          cost: playPointsCost(1),
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
