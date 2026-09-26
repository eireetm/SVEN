// BP17-018 Heroic Fairy Champion — Forestcraft follower, 4, 4/4. 妖精.
// Ward.
// {[fanfare]} {[cost02]} Give this {[attack]}+2/{[defense]}+2.
// Strike - For the rest of this turn, this doesn't take damage ("-2/-2" isn't damage — ruling).
import { playPointsCost } from "../costs";
import { defineCard, fanfare, strike } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
    strike({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.preventDamage(fx.self, "all", "endOfTurn");
      },
    }),
  ],
});
