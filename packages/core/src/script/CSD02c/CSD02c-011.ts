// CSD02c-011 Kumiko Matsuyama (Evolved) — 5/5.
// On Evolve - Select a Passion follower that costs 3 or less in your cemetery and summon it. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { followerThat, passion } from "../CP02/shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(followerThat(passion), costAtMost(3)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
