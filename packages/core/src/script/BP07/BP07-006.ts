// BP07-006 Setus, the Beastblade (Evolved) — 4/6.
// Ward.
// On Evolve - Select a follower in your cemetery that costs 3 or less and summon it. (元のコスト.)
// At the start of your end phase, give your leader {[defense]}+4 and, if a follower was put from
// your field into the cemetery this turn, give this follower {[attack]} +2/{[defense]}+2.
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";
import { setusEndPhase } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isFollower, costAtMost(3)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    setusEndPhase,
  ],
});
