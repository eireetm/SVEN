// CP01-074 Inari One — Havencraft follower, 2, 2/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Discard an amulet: Give this follower {[attack]}+2 and Rush. (CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, fanfare, serveAbility } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: discardA(isAmulet),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 2, 0);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
  ],
});
