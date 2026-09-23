// BP01-147 Curate — Havencraft follower, 6, 5/5.
// {[fanfare]} Give your leader +5 defense. Draw a card.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
        yield* fx.draw(1);
      },
    }),
  ],
});
