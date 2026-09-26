// BP13-073 Laura, Crimson Strife — Abysscraft follower, 2, 3/2. 魔界・キラー.
// During your turn, whenever your leader loses defense, choose one that you haven't chosen this turn.
// (1) Select an enemy follower on the field and deal it damage equal to the number of times your leader
// has lost defense this turn. (2) Give this follower {[attack]}+1/{[defense]}+1. (3) Give this follower
// Storm.
// (Per Laura; (1) can't be chosen without a target; the times include costs like BP08-084's — rulings.)
import type { Mode } from "../types";
import { defineCard, whenYourLeaderLosesDefense } from "../helpers";
import { enemyFollower } from "../targets";

/** An option this Laura hasn't chosen this turn; choosing it records it. */
const once = (mode: Mode): Mode => ({
  ...mode,
  available: (g, _p, self) => g.usesThisTurn(self, `option:${mode.id}`) === 0,
  *resolve(fx) {
    fx.recordUse(`option:${mode.id}`);
    yield* mode.resolve(fx);
  },
});

export default defineCard({
  abilities: [
    whenYourLeaderLosesDefense(
      {
        modes: [
          once({
            id: "damage",
            label: "(1) Damage to an enemy follower equal to the times your leader lost defense this turn",
            targets: [enemyFollower()],
            *resolve(fx) {
              yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.leaderDefenseLostThisTurn(fx.controller));
            },
          }),
          once({
            id: "stats",
            label: "(2) This follower +1/+1",
            *resolve(fx) {
              if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
            },
          }),
          once({
            id: "storm",
            label: "(3) This follower gains Storm",
            *resolve(fx) {
              if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
            },
          }),
        ],
      },
      { onlyYourTurn: true },
    ),
  ],
});
