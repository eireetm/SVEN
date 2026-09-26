// BP15-043 Acid Golem — Runecraft follower, 2, 2/2. ゴーレム・魔法生物・禁忌.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} - Earth Rite: Select an enemy leader or enemy follower on the field and deal it 2 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      earthRite: { mode: "required" },
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
