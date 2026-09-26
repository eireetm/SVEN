// BP10-107 Stalwart Featherfolk — Havencraft follower, 1, 2/2. 信仰・鳥族.
// Ward.
// {[fanfare]} {[cost02]} Give this follower {[attack]}+1/{[defense]}+1 and Storm.
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
