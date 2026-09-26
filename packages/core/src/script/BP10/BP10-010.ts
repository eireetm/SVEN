// BP10-010 Salvia Panther (Evolved) — Forestcraft follower, 4/3. 植物族・獣.
// Storm.
// On Evolve - Select an enemy follower that costs 3 or less on the field and return it to its owner's
// hand. (元のコスト: an evolved follower's is its base card's — ruling. A token returned to the hand
// is removed from the game, CR 9.1.4.1.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: costAtMost(3) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
