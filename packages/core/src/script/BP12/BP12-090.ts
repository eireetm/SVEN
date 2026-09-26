// BP12-090 Gullias, Silverbeast Lord (Evolved) — Havencraft follower, 4/5. 機械・信仰・超克.
// On Evolve - Choose one. (1) Select an enemy follower on the field and deal it 5 damage. (2) Give each
// other Machina follower on your field {[attack]}+1/{[defense]}+1. ((1) can't be chosen without a
// target — ruling.)
// Activate, banish 2 cards named Repair Mode from your EX area: Give this follower Storm.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { machina } from "./shared";
import { galliasStorm } from "./shared-haven";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "damage",
          label: "(1) 5 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          },
        },
        {
          id: "buff",
          label: "(2) Your other Machina followers +1/+1",
          *resolve(fx) {
            for (const id of fx.game.followers(fx.controller)) {
              if (id !== fx.self && machina(fx.game, id)) yield* fx.giveStats(id, 1, 1);
            }
          },
        },
      ],
    }),
    galliasStorm,
  ],
});
