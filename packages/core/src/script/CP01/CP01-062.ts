// CP01-062 Twin Turbo — Abysscraft follower, 2, 3/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Assail.
// {[fanfare]} If there are at least 10 Umamusume cards in your cemetery, give this follower Storm.
import { defineCard, fanfare, serveAbility } from "../helpers";
import { umamusumeInCemetery } from "./shared";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field" && umamusumeInCemetery(fx.game, fx.controller) >= 10) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
