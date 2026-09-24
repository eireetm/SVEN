// BP04-071 Dragonewt Fist — Dragoncraft spell, 2. ドラゴニュート・竜族.
// (BP04-072 is the same card.)
// When this card is discarded, you may put it into your EX area.
// Select an enemy follower on the field and deal it 3 damage.
import { defineCard, spell, whenDiscarded } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    whenDiscarded({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery" && (yield* fx.confirm())) yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
