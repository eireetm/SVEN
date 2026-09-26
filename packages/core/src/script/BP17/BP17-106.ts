// BP17-106 Technomancer — Havencraft follower, 1, 1/1. 機械・超克.
// {[fanfare]} Put a Repair Mode token into your EX area. Then, if there are at least 3 Machina cards in your EX area, draw
// a card. (The Repair Mode just put there counts — ruling.)
import { defineCard, fanfare } from "../helpers";
import { machinaInEx, REPAIR } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
        if (machinaInEx(fx.game, fx.controller) >= 3) yield* fx.draw(1);
      },
    }),
  ],
});
