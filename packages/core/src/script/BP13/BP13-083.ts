// BP13-083 Linkstaff Necromancer (Evolved) — Abysscraft follower, 4/4. 死霊術師.
// On Evolve - Select a Departed follower that costs 3 or less in your cemetery and summon it. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isFollower, hasTrait("死者"), costAtMost(3)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
