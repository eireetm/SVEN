// BP14-098 Spiritual Blow — Havencraft spell, 3. 信仰.
// {[quick]}
// Select an enemy follower on the field and banish it.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
