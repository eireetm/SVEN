// BP15-021 Kagemitsu, Lost Samurai — Swordcraft follower, 2, 2/2. 挑戦者・兵士.
// This can't be played from the EX area.
// ----------
// {[evolve]} {[cost02]}: Evolve this.
// Rush.
// Whenever a follower on your field evolves, place a fighting spirit counter on this in your EX area. Then, if this
// has at least 2 fighting spirit counters, you may summon it. If you do, evolve it. (Valid in the EX area; it keeps
// its counters; evolving it may be declined — rulings.)
// {[lastwords]} Put this into its owner's EX area. (A full EX area can't take it — ruling.)
import { defineCard, evolveAbility, lastWords, whenYourFollowerEvolves } from "../helpers";
import { hasRoom } from "./shared";
import { SPIRIT } from "./shared-sword";

export default defineCard({
  playableIf: (g, self) => g.playZone(self) !== "ex",
  keywords: ["rush"],
  abilities: [
    evolveAbility(2),
    {
      ...whenYourFollowerEvolves({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "ex") return;
          yield* fx.addCounters(fx.self, SPIRIT, 1);
          if (fx.game.counters(fx.self, SPIRIT) < 2 || !hasRoom(fx.game, fx.controller, "field")) return;
          if (!(yield* fx.confirm())) return;
          const [summoned] = yield* fx.putOntoField([fx.self]);
          if (summoned !== undefined && fx.game.card(summoned)?.zone === "field") yield* fx.evolve(summoned);
        },
      }),
      validIn: ["ex"],
    },
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
