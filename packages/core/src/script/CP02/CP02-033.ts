// CP02-033 Miho Kohinata (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If there are at least 5 Cute cards in your cemetery,
// deal 3 damage instead.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { cute, inYourCemetery } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, inYourCemetery(fx.game, fx.controller, cute) >= 5 ? 3 : 2);
      },
    }),
  ],
});
