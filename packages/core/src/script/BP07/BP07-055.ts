// BP07-055 Wildfire Tyrannosaur — Dragoncraft follower, 8, 6/6. 自然・竜族.
// When this card is discarded, {[cost01]}: Select an enemy follower on the field and deal it 3
// damage. (The cost may be left unpaid; also for the hand limit — rulings, CR 10.4.7.4.)
// Activate Banish a Naterran Great Tree from your field: Deal 3 damage to each enemy follower on the
// field.
import { banishFromYour, playPointsCost } from "../costs";
import { activated, defineCard, whenDiscarded } from "../helpers";
import { enemyFollower } from "../targets";
import { isTree } from "./shared";

export default defineCard({
  abilities: [
    whenDiscarded({
      cost: playPointsCost(1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    activated(
      { custom: banishFromYour(["field"], isTree) },
      {
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 3);
        },
      },
    ),
  ],
});
