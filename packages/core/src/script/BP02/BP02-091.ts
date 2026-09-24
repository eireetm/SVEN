// BP02-091 Enstatued Seraph — Havencraft amulet, 6.
// This card can't be destroyed by abilities. (CR 1.3.3 — ruling)
// At the start of your end phase, put a prayer counter on this card. Then, if this card has at
// least 4 prayer counters, put it into your cemetery, give your leader {[defense]}+10, and search
// your deck for up to 2 cards and put them into your EX area. Those cards cost 0 play points to
// play. (Counters CR 15.1; "up to 2 cards" has no condition, so they are not revealed, 5.8.1.2;
// the cost is set to 0 on those card objects, 10.4.4.1.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  cannotBeDestroyedByAbilities: true,
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.addCounters(fx.self, "prayer", 1);
        if (fx.game.counters(fx.self, "prayer") < 4) return;
        yield* fx.bury([fx.self]);
        yield* fx.giveLeaderDefense(fx.controller, 10);
        for (const card of yield* fx.search(() => true, { max: 2, to: "ex", reveal: false })) yield* fx.setPlayCost(card, 0);
      },
    }),
  ],
});
