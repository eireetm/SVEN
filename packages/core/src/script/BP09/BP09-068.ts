// BP09-068 Dragon's Handspur — Dragoncraft spell, 2. 竜族.
// Select an enemy follower on the field. Deal it 2 damage and draw a card. (Without a target it can't
// be played — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
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
