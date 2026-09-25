// BP07-037 Belphomet, Lord of Aiolon — Runecraft follower, 7, 5/5. 機械・超克.
// Rush.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may summon any number of
// Machina followers that cost a total of 6 or less. Put the rest on the bottom of your deck in any
// order. (元のコスト. Their Fanfares resolve afterwards, in any order — ruling.)
// At the start of your end phase, give each other Machina follower on your field {[attack]}
// +1/{[defense]}+1.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { and, isFollower } from "../targets";
import { machina, selectWithinTotalCost } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(5);
        const machinaFollowers = top.filter((id) => and(isFollower, machina)(fx.game, id));
        const chosen = yield* selectWithinTotalCost(fx, machinaFollowers, 6, Number.POSITIVE_INFINITY, top);
        yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) if (id !== fx.self && machina(fx.game, id)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
