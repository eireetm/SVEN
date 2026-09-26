// BP20-115 Dogged One (Evolved) — 3/3.
// On Evolve - Select a follower on your field and give it Rush and Assail.
import { defineCard, onEvolve } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [yourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveKeyword(target, "rush");
        yield* fx.giveKeyword(target, "assail");
      },
    }),
  ],
});
