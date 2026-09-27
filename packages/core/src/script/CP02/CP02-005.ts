// CP02-005 Yuzu Kitami (Evolved) — 2/2.
// Ward.
// On Evolve - Select an enemy follower that costs 2 or less on the field and return it to its owner's hand. (元のコスト: an
// evolved follower's is its base card's — ruling.)
// Activate, Lesson (1): Select another card that costs 1 or less on your field and return it to its owner's hand. For the
// rest of this turn, this card's Activate abilities can't be activated.
import { lesson } from "../costs";
import { activated, defineCard, onEvolve } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";
import { anotherCardCostingAtMost } from "./shared";

const EXCEPT_EVOLVE = false;

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: costAtMost(2) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
    activated(
      { custom: lesson(1) },
      {
        targets: [anotherCardCostingAtMost(1)],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
          yield* fx.cantActivate(fx.self, EXCEPT_EVOLVE);
        },
      },
    ),
  ],
});
