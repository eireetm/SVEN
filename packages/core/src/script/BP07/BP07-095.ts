// BP07-095 Robofalcon (Evolved) — 2/4.
// Storm.
// Strike - Put a Repair Mode token into your EX area. Then, if there are at least 3 cards named Repair
// Mode in your EX area, give this follower {[attack]}+1.
// On Evolve - Put a Repair Mode token into your EX area.
import { defineCard, onEvolve } from "../helpers";
import { REPAIR, robofalconStrike } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    robofalconStrike,
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
