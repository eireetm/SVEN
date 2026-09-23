// BP01-160 Bellringer Angel (Evolved) — 0/2.
// Ward. // On Evolve: Select an enemy follower on the field and deal it 2 damage.
// {[lastwords]} Draw a card.
import { defineCard, lastWords, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
