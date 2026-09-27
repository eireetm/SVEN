// CP01-043 Seiun Sky — Dragoncraft follower, 3, 1/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Storm. Intimidate.
// Strike: Give this follower {[attack]}+1.
import { defineCard, serveAbility, strike } from "../helpers";

export default defineCard({
  keywords: ["storm", "intimidate"],
  abilities: [
    serveAbility(1, 1),
    strike({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
      },
    }),
  ],
});
