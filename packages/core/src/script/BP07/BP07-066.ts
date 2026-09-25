// BP07-066 Doting Dragoneer (Evolved) — 3/3.
// On Evolve - Select a {[dragoncraft]} follower that costs 3 or less in your cemetery and summon it.
// (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Dragoncraft"), costAtMost(3)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
