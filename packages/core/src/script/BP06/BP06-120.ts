// BP06-120 Bazooka Goblins (Evolved) — Neutral follower, 5/5. ゴブリン.
// On Evolve - Select an enemy card that costs 2 or less on the field and destroy it.
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, enemyCardOnField } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyCardOnField({ filter: costAtMost(2) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
