// BP07-034 Elegance in Action — Swordcraft spell, 1. 兵士・メイド.
// When this card is discarded, select an enemy follower on the field and engage it. (Also for the
// hand limit — ruling.)
// Select an enemy follower on the field and engage it. Draw a card. (An engaged one can be
// selected; the draw still happens — ruling.)
import { defineCard, spell, whenDiscarded } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    whenDiscarded({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
      },
    }),
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
  ],
});
