// BP16-086 Soul Predation — Abysscraft spell, 2. 魔界.
// Select an enemy follower on the field and a follower on your field. Destroy them and draw a card. (Not playable
// without both — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower(), yourFollower()],
      *resolve(fx) {
        yield* fx.destroy([fx.targets[0]![0]!, fx.targets[1]![0]!]);
        yield* fx.draw(1);
      },
    }),
  ],
});
