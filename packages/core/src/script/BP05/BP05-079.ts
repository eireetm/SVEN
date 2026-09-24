// BP05-079 Silent Purge — Abysscraft spell, 4. 絶傑・死霊術師.
// Select an enemy follower on the field and destroy it. Its controller discards a random card.
// (Playable with an empty enemy hand — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
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
