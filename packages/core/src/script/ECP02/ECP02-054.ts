// ECP02-054 Chitose Kurosaki [Memento Mori] (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field. Deal it 3 damage and bury the top 2 cards of your deck. (Not playable without
// an enemy follower to select — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.mill(2);
      },
    }),
  ],
});
