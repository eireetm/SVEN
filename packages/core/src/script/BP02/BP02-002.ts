// BP02-002 Crystalia Tia (Evolved) — 2/2.
// On Evolve: Select a Crystalia Eve token on your field. Give it {[attack]}+1/{[defense]}+1 and
// Rush. (Any Crystalia Eve, however it was summoned — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { and, isToken, named, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [yourFollower({ filter: and(isToken, named("Crystalia Eve")) })],
      *resolve(fx) {
        const eve = fx.targets[0]![0]!;
        yield* fx.giveStats(eve, 1, 1);
        yield* fx.giveKeyword(eve, "rush");
      },
    }),
  ],
});
