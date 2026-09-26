// BP10-T01 Exterminus Weapon — Swordcraft token follower, 2, 6/6. 機械・兵士.
// Ward.
// {[fanfare]} Select an enemy card on the field and destroy it.
// {[lastwords]} Deal 4 damage to each enemy leader.
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyCardOnField } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyCardOnField()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 4);
      },
    }),
  ],
});
