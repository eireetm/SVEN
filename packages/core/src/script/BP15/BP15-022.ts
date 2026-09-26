// BP15-022 Kagemitsu, Lost Samurai (Evolved) — Swordcraft follower, 3/3. 挑戦者・兵士.
// Activate Remove a fighting spirit counter from this: Select an enemy follower on the field and deal it 1 damage.
// Activate Remove 5 fighting spirit counters from this: Deal 5 damage to each enemy leader and enemy follower on the
// field. Give this Storm.
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { removeSpirit } from "./shared-sword";

export default defineCard({
  abilities: [
    activated(
      { custom: removeSpirit(1) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
    activated(
      { custom: removeSpirit(5) },
      {
        *resolve(fx) {
          const opp = fx.game.opponent(fx.controller);
          yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 5);
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
