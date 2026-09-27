// CP01-066 Mejiro McQueen — Havencraft follower, 4, 4/4. ウマ娘・メジロ家.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Ward.
// {[fanfare]} Put an amulet from your field into its owner's cemetery: Select an enemy leader or enemy follower on the field and
// deal it 3 damage. (Burying isn't destroying: an amulet that can't be destroyed may be put there — ruling; CR 10.4.7.4.)
import { buryFromYourField } from "../costs";
import { defineCard, evolveAbility, fanfare, serveAbility } from "../helpers";
import { enemyLeaderOrFollower, isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    serveAbility(1, 1),
    fanfare({
      cost: buryFromYourField(isAmulet),
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
