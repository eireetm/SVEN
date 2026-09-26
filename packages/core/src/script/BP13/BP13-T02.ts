// BP13-T02 Resentful Blaze — Runecraft spell token, 1. 魔法使い・学院・プリンセス・キラー.
// Choose one. (1) Select an enemy follower on the field and deal it 4 damage. (2) Select 2 enemy followers on
// the field and, if there are at least 15 Academic cards in your cemetery, deal them 4 damage. ((2) needs 2
// targets but not the 15 cards — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { academic, countIn } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "one",
          label: "(1) 4 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          },
        },
        {
          id: "two",
          label: "(2) 4 damage to 2 enemy followers with 15 Academic cards in your cemetery",
          targets: [enemyFollower({ count: 2 })],
          *resolve(fx) {
            if (countIn(fx.game, fx.controller, "cemetery", academic) >= 15) yield* fx.dealDamageEach(fx.targets[0]!, 4);
          },
        },
      ],
    }),
  ],
});
