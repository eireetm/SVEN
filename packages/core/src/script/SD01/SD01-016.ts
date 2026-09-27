// SD01-016 Sylvan Justice — Forestcraft spell, 2. エルフ族. {[quick]}
// Select an enemy follower on the field. Deal it 3 damage and put a Fairy token into your EX area. (Playable with a full EX area;
// not without a follower to select — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { FAIRY } from "../BP13/shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.tokensToEx([FAIRY]);
      },
    }),
  ],
});
