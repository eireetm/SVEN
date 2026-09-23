// BP01-123 Wardrobe Raider (Evolved) — 3/3.
// On Evolve, put a follower from your field into its owner's cemetery: Select an enemy follower
// on the field and destroy it. (Only your own followers; this one itself is allowed; buried
// Last Words followers trigger — rulings.)
import { defineCard, onEvolve } from "../helpers";
import { buryFromYourField } from "../costs";
import { enemyFollower, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: buryFromYourField(isFollower),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
