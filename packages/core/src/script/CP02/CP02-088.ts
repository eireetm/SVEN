// CP02-088 Shin Sato (Evolved) — 5/5.
// On Evolve - Select a follower that costs 8 or less in your cemetery and summon it. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: (g, id) => isFollower(g, id) && costAtMost(8)(g, id) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
