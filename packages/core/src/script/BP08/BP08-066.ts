// BP08-066 Geovore (Evolved) — Dragoncraft follower, 5/7. 竜族.
// Strike — You may banish 5 cards in your cemetery; if paid, this gets +2 attack (CR 10.4.7.4,
// 12.7.1).
import { banishFromYour } from "../costs";
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      cost: banishFromYour(["cemetery"], () => true, 5),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
