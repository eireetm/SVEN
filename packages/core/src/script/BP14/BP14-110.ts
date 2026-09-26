// BP14-110 Angel's Blessing — Neutral spell, 3. 天使.
// {[quick]}
// Give your leader {[defense]}+2. Draw 2 cards.
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(2);
      },
    }),
  ],
});
