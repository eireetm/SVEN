// SD03-010 Sammy, Wizard's Apprentice — Runecraft follower, 1, 2/1. 魔法使い.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Look at the top card of your deck. You may put it into your cemetery. (Only you see it; if kept, it stays on top —
// rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        const [top] = fx.topCards(1);
        if (top === undefined) return;
        yield* fx.lookAt([top]);
        if (yield* fx.confirm(fx.controller, top)) yield* fx.bury([top]);
      },
    }),
  ],
});
