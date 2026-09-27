// CP02-010 Yumi Aiba (Evolved) — 4/4.
// On Evolve - Select an enemy follower with 3 defense or less on the field and put it on the bottom of its owner's deck.
// (A token put into the deck is removed from the game, CR 9.1.4.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 3 })],
      *resolve(fx) {
        yield* fx.putOnDeck(fx.targets[0]!, "bottom");
      },
    }),
  ],
});
