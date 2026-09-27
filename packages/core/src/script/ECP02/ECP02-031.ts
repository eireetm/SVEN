// ECP02-031 Sae Kobayakawa [Dancing Flowers] (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If there's a Cute card, Cool card, and Passion card in your
// cemetery, deal 4 damage instead. (One card with all three types is enough — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { cool, cute, inYourCemetery, passion } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const g = fx.game;
        const all = [cute, cool, passion].every((type) => inYourCemetery(g, fx.controller, type) > 0);
        yield* fx.dealDamage(fx.targets[0]![0]!, all ? 4 : 2);
      },
    }),
  ],
});
