// BP13-040 Mileka, Celestial Seer — Runecraft follower, 1, 1/1. 錬金術師・星神.
// {[evolve]} {[cost02]}: Evolve this follower.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. Bury 1 from among them. Put the rest on the bottom of
// your deck in any order.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(5);
        yield* fx.bury(yield* fx.selectCards(top, 1, 1, fx.controller, top));
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
