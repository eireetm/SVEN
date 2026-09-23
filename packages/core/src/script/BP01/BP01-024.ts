// BP01-024 Woodkin Curse — Forestcraft spell, 2. {[quick]}
// Select an enemy follower on the field. It cannot deal damage this turn.
// (Its attacks deal no damage at all; Bane still destroys — rulings, CR 5.14.2, 12.14.2.1.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.cannotDealDamage(fx.targets[0]![0]!, "endOfTurn");
      },
    }),
  ],
});
