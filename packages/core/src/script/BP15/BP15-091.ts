// BP15-091 Hermit of Silence — Abysscraft follower, 6, 5/5. 絶傑・死霊術師.
// {[fanfare]} Select an enemy follower on the field and destroy it. Its controller discards a random card.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const controller = fx.game.controller(target);
        yield* fx.destroy([target]);
        yield* fx.discardRandom(1, controller);
      },
    }),
  ],
});
