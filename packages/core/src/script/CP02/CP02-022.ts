// CP02-022 Mio Honda — Swordcraft follower, 2, 2/1. デレマス・パッション.
// Storm.
// Strike - If there's a follower with "Uzuki Shimamura" in its name on your field, give this follower {[defense]}+1.
// Strike - If there's a follower with "Rin Shibuya" in its name on your field, give this follower {[attack]}+1.
import { defineCard, strike } from "../helpers";
import { nameOnYourField } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      condition: (g, c) => nameOnYourField(g, c, "Uzuki Shimamura"),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 0, 1);
      },
    }),
    strike({
      condition: (g, c) => nameOnYourField(g, c, "Rin Shibuya"),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 0);
      },
    }),
  ],
});
