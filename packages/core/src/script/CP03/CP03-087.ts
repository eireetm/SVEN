// CP03-087 Blaster Dark (Evolved) — 4/4.
// Single Drive.
// On Evolve - Select an enemy follower on the field. Deal it 3 damage, then deal it 1 more damage for every 5 Shadow Paladin
// cards in your cemetery. (Two damages: 3, then 2 with 10 of them — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, shadowPaladin } from "./shared";

export default defineCard({
  keywords: ["singleDrive"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamage(target, 3);
        const more = Math.floor(countIn(fx.game, fx.controller, "cemetery", shadowPaladin) / 5);
        if (more > 0) yield* fx.dealDamage(target, more);
      },
    }),
  ],
});
