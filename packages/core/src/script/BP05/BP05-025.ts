// BP05-025 Disciple of Usurpation — Swordcraft follower, 3, 3/2. 絶傑・盗賊.
// Storm.
// Strike: Each opponent puts the top card of their deck into their cemetery. Then, if there are
// at least 10 cards in opponents' cemeteries, give this follower {[attack]}+2.
import { defineCard, strike } from "../helpers";
import { opponentCemeteryTen } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.mill(1, fx.game.opponent(fx.controller));
        if (opponentCemeteryTen(fx.game, fx.controller)) yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
