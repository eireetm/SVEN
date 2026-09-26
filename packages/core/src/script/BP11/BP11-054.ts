// BP11-054 Resplendent Phoenix — Dragoncraft follower, 3, 3/3. 不死鳥.
// Ward.
// {[fanfare]} {[cost02]} If Overflow is active for you, shuffle your deck, then put the top card of your
// deck into your EX area. It costs 0 to play this turn. (Other cost changes apply after the 0 —
// ruling, CR 10.10.2.4.)
// {[lastwords]} Give your leader {[defense]}+2.
import { playPointsCost } from "../costs";
import { defineCard, fanfare, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      condition: (g, p) => g.overflow(p),
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.shuffleDeck();
        for (const card of yield* fx.topToEx(1)) yield* fx.setPlayCost(card, 0, "endOfTurn");
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
