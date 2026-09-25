// BP06-067 Swordwhip Dragoon — Dragoncraft follower, 2, 1/1. 竜使い.
// {[fanfare]} Select up to 2 enemy followers on the field and deal 2 damage divided between them.
// If Overflow is active for you, deal 4 damage divided between them instead. (At least 1 to each
// selected follower — rulings BP08-028 / EBD02-015.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], fx.game.overflow(fx.controller) ? 4 : 2);
      },
    }),
  ],
});
