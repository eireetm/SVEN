// BP18-T09 Totem of Madness — Havencraft amulet token, 4. 狂信・偶像.
// At the start of your end phase, place a curse counter on this. Then, if this has 1 curse counter, deal 1 damage to your
// leader. If it has 2, discard a card. If it has 3, discard a card, deal 3 damage to your leader, and bury this.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.addCounters(fx.self, "curse", 1);
        const n = fx.game.counters(fx.self, "curse");
        const leader = fx.game.leader(fx.controller);
        if (n === 1) yield* fx.dealDamage(leader, 1);
        else if (n === 2) yield* fx.discard(fx.controller, 1, 1);
        else if (n === 3) {
          yield* fx.discard(fx.controller, 1, 1);
          yield* fx.dealDamage(leader, 3);
          yield* fx.bury([fx.self]);
        }
      },
    }),
  ],
});
