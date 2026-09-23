// BP01-070 Lightning Shooter — Runecraft follower, 4, 3/3.
// {[fanfare]} Select an enemy follower on the field and deal it 2 damage. Spellchain (5): Deal 4
// damage instead. SC (10): Deal 2 damage to that follower's leader.
// (SC10: 4 to the follower and 2 to its leader; no leader damage without a follower — rulings.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const t = fx.targets[0]![0]!;
        const sc = fx.game.spellsInCemetery(fx.controller); // fixed now (CR 13.3.1.4)
        const damage = [{ target: t, amount: sc >= 5 ? 4 : 2 }];
        if (sc >= 10) damage.push({ target: fx.game.leader(fx.game.controller(t)), amount: 2 });
        yield* fx.dealDamages(damage);
      },
    }),
  ],
});
