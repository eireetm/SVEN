// BP10-121 Corruption Guardian — Neutral follower, 5, 3/6. 堕天使.
// Ward.
// {[fanfare]} Discard an Angel or Fallen Angel card: Give your leader {[defense]}+3. Draw a card.
// Recover 2 play points.
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { angelic } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: discardA(angelic),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.draw(1);
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
