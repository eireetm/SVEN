// BP09-095 Whitefang Temple — Havencraft amulet, 3. 信仰・獣.
// At the start of your end phase, place a prayer counter on this card and give your leader
// {[defense]}+1.
// At the start of your main phase, if this card has at least 3 prayer counters, bury it, then search
// your deck for a Faith follower that costs 4 or less, summon it, and shuffle your deck. (元のコスト.)
import { atStartOfYourEndPhase, atStartOfYourMainPhase, defineCard } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";

const faithFollower = and(isFollower, hasTrait("信仰"), costAtMost(4));

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "prayer", 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
    atStartOfYourMainPhase({
      condition: (g, _c, self) => g.counters(self, "prayer") >= 3,
      *resolve(fx) {
        yield* fx.bury([fx.self]);
        yield* fx.search((id) => faithFollower(fx.game, id), { to: "field" });
      },
    }),
  ],
});
