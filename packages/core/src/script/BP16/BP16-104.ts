// BP16-104 Serene Sanctuary — Havencraft amulet, 1. 信仰.
// {[fanfare]} Search your deck for a Luminary amulet, reveal it, add it to your hand, then shuffle.
// Activate {[engage]} this: Bury this. Activate only if this has a prayer counter.
// {[lastwords]} Give your leader {[defense]}+1.
import { activated, defineCard, fanfare, lastWords } from "../helpers";
import { isAmulet } from "../targets";
import { luminary } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isAmulet(fx.game, id) && luminary(fx.game, id));
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, _p, self) => g.counters(self, "prayer") > 0,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.bury([fx.self]);
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
