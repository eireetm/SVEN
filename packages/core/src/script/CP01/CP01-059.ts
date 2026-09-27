// CP01-059 Mayano Top Gun — Abysscraft follower, 1, 2/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Rush.
// {[fanfare]} If there are 4 other Umamusume cards on your field, give this follower Storm. (「4枚なら」: with this card the field
// is full, so 4 is also "at least 4".)
// {[fanfare]} If there are at least 5 Umamusume cards in your cemetery, give this follower {[attack]}+2.
import { defineCard, fanfare, serveAbility } from "../helpers";
import { umamusume, umamusumeInCemetery } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        if (g.card(fx.self)?.zone !== "field") return;
        if (g.cards(fx.controller, "field").filter((id) => id !== fx.self && umamusume(g, id)).length === 4) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field" && umamusumeInCemetery(fx.game, fx.controller) >= 5) yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
