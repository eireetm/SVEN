// BP11-095 Shady Priest — Havencraft follower, 1, 2/1. 荒野・信仰.
// {[fanfare]} Put a Dutiful Steed token into your EX area.
// Whenever a Mount card you control leaves the field, {[cost03]}: Select an enemy follower on the field
// and banish it. (Also during the opponent's turn — ruling.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare, whenYourCardLeaves } from "../helpers";
import { enemyFollower } from "../targets";
import { leftAsMount, STEED } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([STEED]);
      },
    }),
    whenYourCardLeaves(
      {
        cost: playPointsCost(3),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.banish(fx.targets[0]!);
        },
      },
      { filter: leftAsMount },
    ),
  ],
});
