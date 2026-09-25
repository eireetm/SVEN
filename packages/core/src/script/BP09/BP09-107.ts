// BP09-107 Paradise Vanguard (Evolved) — Neutral follower, 3/3. 天使.
// On Evolve - Select an enemy follower that costs 4 or less on the field and banish it. (元のコスト; an
// evolved follower has its base card's cost — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: costAtMost(4) })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
