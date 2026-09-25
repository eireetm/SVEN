// BP07-044 Mechanized Lifeform — Runecraft follower, 2, 3/1. 機械・禁忌.
// {[fanfare]} Put a Repair Mode token into your EX area.
// Once per turn, when you play a Machina card, draw a card. (In either player's turn — ruling.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { REPAIR, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
    whenYouPlay(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
      machina,
    ),
  ],
});
