// BP15-T01 Gilded Blade — Swordcraft spell token, 2. 財宝.
// Select an enemy follower on the field. Deal it 2 damage and, if there are at least 10 cards in opponents'
// cemeteries, deal 2 damage to its leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { opponentsCemetery10 } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 2);
        if (opponentsCemetery10(fx.game, fx.controller)) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
