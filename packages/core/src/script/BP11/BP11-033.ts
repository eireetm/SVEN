// BP11-033 Bandit Raid — Swordcraft spell, 3. 盗賊.
// Look at the top 4 cards of your deck. You may summon a follower that costs 3 or less from among them.
// Put the rest on the bottom of your deck in any order. If you summoned a Thief follower, give it
// {[attack]}+1/{[defense]}+1 and Rush.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const [summoned] = yield* lookAtTopCards(fx, 4, { filter: and(isFollower, costAtMost(3)), to: "field" });
        if (summoned === undefined || !hasTrait("盗賊")(fx.game, summoned) || fx.game.card(summoned)?.zone !== "field") return;
        yield* fx.giveStats(summoned, 1, 1);
        yield* fx.giveKeyword(summoned, "rush");
      },
    }),
  ],
});
