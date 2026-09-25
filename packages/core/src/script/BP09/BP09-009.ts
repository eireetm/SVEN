// BP09-009 Storied Falconer (Evolved) — Forestcraft follower, 4/4. 狩人・獣.
// On Evolve - Select a Holy Falcon on your field. Give it {[attack]}+1 and Bane.
import { defineCard, onEvolve } from "../helpers";
import { named, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [yourFollower({ filter: named("Holy Falcon") })],
      *resolve(fx) {
        const falcon = fx.targets[0]![0]!;
        yield* fx.giveStats(falcon, 1, 0);
        yield* fx.giveKeyword(falcon, "bane");
      },
    }),
  ],
});
