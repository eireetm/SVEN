// CSD02b-006 Yukimi Sajo (Evolved) — 3/3.
// On Evolve - Select another Cool follower on your field. Give it {[attack]}+1, Rush, and Assail.
import { defineCard, onEvolve } from "../helpers";
import { anotherYourFollower } from "../targets";
import { cool } from "../CP02/shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [anotherYourFollower({ filter: cool })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 1, 0);
        yield* fx.giveKeyword(target, "rush");
        yield* fx.giveKeyword(target, "assail");
      },
    }),
  ],
});
