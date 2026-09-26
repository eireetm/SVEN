// BP19-091 Prison of Pain — Abysscraft amulet, 2. 魔界.
// {[fanfare]} Put 2 pain counters on this. Draw a card.
// Activate {[engage]} this and remove a pain counter from this: Deal 1 damage to your leader. If this has no pain counters,
// bury this.
import { removeCountersFromThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "pain", 2);
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true, custom: removeCountersFromThis("pain", 1) },
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
          if (fx.game.card(fx.self)?.zone === "field" && fx.game.counters(fx.self, "pain") === 0) yield* fx.bury([fx.self]);
        },
      },
    ),
  ],
});
