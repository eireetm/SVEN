// BP16-117 Leah, Bellringer Angel — Neutral follower, 1, 0/3. 天使.
// Ward.
// {[lastwords]} Give your leader {[defense]}+1. Draw a card.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
