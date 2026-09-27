// ECP02-018 Airi Totoki [Cinderella Girl] (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field. Deal it 2 damage and, if there are at least 5 Passion cards in your cemetery,
// put a Magical Item token into your EX area. (Not playable without an enemy follower to select — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { inYourCemetery, magicalItems, passion } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        if (inYourCemetery(fx.game, fx.controller, passion) >= 5) yield* magicalItems(fx);
      },
    }),
  ],
});
