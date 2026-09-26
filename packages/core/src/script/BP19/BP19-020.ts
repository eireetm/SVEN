// BP19-020 Barbaros, Briny Convict (Evolved) — 4/4.
// Loot cards in your EX area cost 1 less to play. (During your turn — the Japanese, Chinese and official English texts.)
// Whenever you play a Loot card during your turn, choose 1 that you haven't already chosen this turn. (1) Select an enemy
// follower on the field and destroy it. (2) Each opponent buries the top 2 cards of their deck. (3) Recover 2 play points.
// (Per Barbaros; (1) can't be chosen without a target — rulings.)
import type { Mode } from "../types";
import { defineCard, whenYouPlay } from "../helpers";
import { enemyFollower } from "../targets";
import { loot } from "./shared";
import { lootDiscount } from "./shared-sword";

/** An option this Barbaros hasn't chosen this turn; choosing it records it (as BP13-073). */
const once = (mode: Mode): Mode => ({
  ...mode,
  available: (g, _p, self) => g.usesThisTurn(self, `option:${mode.id}`) === 0,
  *resolve(fx) {
    fx.recordUse(`option:${mode.id}`);
    yield* mode.resolve(fx);
  },
});

export default defineCard({
  field: { playCostOf: lootDiscount },
  abilities: [
    whenYouPlay(
      {
        triggerIf: (g, c) => g.activePlayer === c,
        modes: [
          once({
            id: "destroy",
            label: "(1) Destroy an enemy follower",
            targets: [enemyFollower()],
            *resolve(fx) {
              yield* fx.destroy(fx.targets[0]!);
            },
          }),
          once({
            id: "mill",
            label: "(2) The opponent buries the top 2 cards of their deck",
            *resolve(fx) {
              yield* fx.mill(2, fx.game.opponent(fx.controller));
            },
          }),
          once({
            id: "recover",
            label: "(3) Recover 2 play points",
            *resolve(fx) {
              yield* fx.recoverPlayPoints(2);
            },
          }),
        ],
      },
      loot,
    ),
  ],
});
