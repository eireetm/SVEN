// BP10-041 Imperator of Magic (Evolved) — Runecraft follower, 2/2. アルカナ・魔法使い.
// On Evolve - Select a Golem follower on your field. Give it Rush and Assail.
import { defineCard, onEvolve } from "../helpers";
import { hasTrait, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [yourFollower({ filter: hasTrait("ゴーレム") })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveKeyword(target, "rush");
        yield* fx.giveKeyword(target, "assail");
      },
    }),
  ],
});
