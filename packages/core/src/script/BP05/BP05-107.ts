// BP05-107 Apostle of Craving (Evolved) — Neutral follower, 3/3. 絶傑.
// On Evolve: Select another follower on the field. Deal it 3 damage and give it {[attack]}+3.
// (Yours or an enemy's — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { anotherFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [anotherFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamage(target, 3);
        yield* fx.giveStats(target, 3, 0);
      },
    }),
  ],
});
