// BP12-106 Seraphic Blade — Neutral spell, 2. 天使.
// Choose one. (1) Select an enemy card that costs 2 or less on the field and destroy it. (2) {[cost02]}:
// Select an enemy card that costs 6 or less on the field and destroy it. (元のコスト: an evolved follower
// has its base card's — ruling. (2)'s play points are optional, like BP05-041.)
import { defineCard, spell } from "../helpers";
import { playPointsCost } from "../costs";
import { costAtMost, enemyCardOnField } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "cheap",
          label: "(1) Destroy an enemy card that costs 2 or less",
          targets: [enemyCardOnField({ filter: costAtMost(2) })],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "pay",
          label: "(2) Pay 2: destroy an enemy card that costs 6 or less",
          cost: playPointsCost(2),
          targets: [enemyCardOnField({ filter: costAtMost(6) })],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
