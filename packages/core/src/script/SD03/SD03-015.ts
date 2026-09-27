// SD03-015 Magic Missile — Runecraft spell, 3. 魔法使い. {[quick]}
// Select an enemy follower on the field. Deal it 2 damage and draw a card. (Not playable without a follower to select — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
