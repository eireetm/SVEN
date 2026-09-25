// BP07-043 Displacer Bot (Evolved) — 4/3.
// Ward.
// On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number
// of Machina cards in your EX area.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, machina } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * countIn(fx.game, fx.controller, "ex", machina));
      },
    }),
  ],
});
