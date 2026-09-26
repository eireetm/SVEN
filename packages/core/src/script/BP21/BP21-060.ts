// BP21-060 Grand Slam Tamer (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field, deal it 2 damage. If there's a card in your EX area with at least 4
// passion counters, deal it 4 damage instead. If it has at least 10, give this {[defense]}+6. (Needs a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { passionInEx } from "./shared";
import { tenPassionDefense } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, passionInEx(fx.game, fx.controller) >= 4 ? 4 : 2);
        yield* tenPassionDefense(fx);
      },
    }),
  ],
});
