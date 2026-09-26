// BP21-101 Pureflame Lady (Evolved) — 2/2.
// Whenever this gains {[defense]}, deal 1 damage to each enemy follower on the field. (Also by super-evolving, CR 12.2.4.1 —
// ruling.)
// On Evolve - Select your leader or a follower on your field and give it {[defense]}+2.
import { defineCard, onEvolve } from "../helpers";
import { yourLeaderOrFollower } from "../targets";
import { pureflame } from "./shared-haven";

export default defineCard({
  abilities: [
    pureflame,
    onEvolve({
      targets: [yourLeaderOrFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (target === fx.game.leader(fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 2);
        else yield* fx.giveStats(target, 0, 2);
      },
    }),
  ],
});
