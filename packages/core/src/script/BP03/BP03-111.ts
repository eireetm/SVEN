// BP03-111 Seraph of Sin — Neutral follower, 4, 4/4. 堕天使.
// {[fanfare]} Deal 2 to an enemy leader or follower.
// {[lastwords]} Add a Fallen Angel card costing 3 or less from your cemetery to your hand.
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyLeaderOrFollower, hasTrait, inYourZone } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    lastWords({
      targets: [
        inYourZone("cemetery", {
          filter: (g, id) => hasTrait("堕天使")(g, id) && (g.info(id).cost ?? 99) <= 3,
        }),
      ],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0] ?? []);
      },
    }),
  ],
});
