// BP07-113 Purgation's Blade — Neutral spell, 3. 超克.
// Select an enemy follower on the field. Destroy it and give each Maisha, Hero of Purgation on your
// field {[attack]}+1 for every follower in your cemetery. (It can't be played without a target —
// ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isFollower, named } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        const x = countIn(fx.game, fx.controller, "cemetery", isFollower);
        if (x === 0) return;
        for (const id of fx.game.followers(fx.controller)) {
          if (named("Maisha, Hero of Purgation")(fx.game, id)) yield* fx.giveStats(id, x, 0);
        }
      },
    }),
  ],
});
