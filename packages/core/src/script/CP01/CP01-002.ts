// CP01-002 Silence Suzuka (Evolved) — 5/2.
// Storm.
// On Evolve: Select an enemy follower on the field and put it on top of its owner's deck. (A token put into the deck is
// removed from the game, CR 9.1.4.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putOnDeck(fx.targets[0]!, "top");
      },
    }),
  ],
});
