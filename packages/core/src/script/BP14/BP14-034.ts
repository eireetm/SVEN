// BP14-034 Night on the Town — Swordcraft spell, 1. 宴楽・指揮官・盗賊.
// Choose 1. (1) Select an enemy follower on the field. Deal it 2 damage and put a Glittering Gold token into
// your EX area. (2) Select an enemy follower on the field and, if there are at least 3 Festive cards in your
// EX area, deal it 4 damage. (Not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, festive, GLITTERING_GOLD } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "gold",
          label: "(1) 2 damage and a Glittering Gold",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
            yield* fx.tokensToEx([GLITTERING_GOLD]);
          },
        },
        {
          id: "damage",
          label: "(2) 4 damage with 3 Festive cards in your EX area",
          targets: [enemyFollower()],
          *resolve(fx) {
            if (countIn(fx.game, fx.controller, "ex", festive) >= 3) yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          },
        },
      ],
    }),
  ],
});
