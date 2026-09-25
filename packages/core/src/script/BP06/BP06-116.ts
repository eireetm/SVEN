// BP06-116 Clash of Heroes — Neutral spell, 1. 挑戦者.
// Select a follower on your field and an enemy follower on the field. Deal the first follower damage
// equal to the second's attack. Deal the second follower damage equal to the first's attack. (Needs
// both; 0 attack deals no damage — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower(), enemyFollower()],
      *resolve(fx) {
        const mine = fx.targets[0]![0]!;
        const theirs = fx.targets[1]![0]!;
        if (fx.game.card(mine)?.zone !== "field" || fx.game.card(theirs)?.zone !== "field") return;
        yield* fx.dealDamages([
          { target: mine, amount: fx.game.info(theirs).attack ?? 0 },
          { target: theirs, amount: fx.game.info(mine).attack ?? 0 },
        ]);
      },
    }),
  ],
});
