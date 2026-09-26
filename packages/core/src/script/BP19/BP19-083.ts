// BP19-083 Underworld Lieutenant (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
// {[lastwords]} Bury the top card of your deck.
import { defineCard, lastWords, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
