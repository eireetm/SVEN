// BP01-019 Archer (Evolved) — 1/4.
// Whenever another follower is put onto your field, select up to 2 enemy followers on the field
// and deal them 1 damage (each — ruling).
import { defineCard, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower({ count: 2, upTo: true })],
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.targets[0]!, 1);
        },
      },
      { another: true },
    ),
  ],
});
