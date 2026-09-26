// BP16-038 Lilanthim, Anathema of Edacity — Runecraft follower, 4, 4/4. アナテマ・魔法使い.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an enemy follower on the field and deal it 2 damage.
// Activate - Earth Rite: Give this Assail.
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { edacityAssail } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    activated({}, edacityAssail),
  ],
});
