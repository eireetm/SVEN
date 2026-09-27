// CP02-036 Shiki Ichinose — Runecraft follower, 5, 2/5. デレマス・キュート.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Look at the top 3 cards of your deck. You may put one of them into your EX area. Bury the rest.
// Activate {[engage]}, discard a card: Select an enemy follower on the field and deal it 5 damage.
import { discardCardsCost } from "../costs";
import { activated, defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: () => true, to: "ex", rest: "cemetery" });
      },
    }),
    activated(
      { engageSelf: true, custom: discardCardsCost(1) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      },
    ),
  ],
});
