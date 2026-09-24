// BP03-001 Beauty and the Beast — Forestcraft follower, 6, 5/7. 獣・童話・プリンセス.
// Rush. Aura.
// {[fanfare]} Put a Fable counter on this card. If this card was put onto the field from
// anywhere other than your hand, give it Storm. (CR 5.5.3. EX, deck and cemetery count — ruling.)
// {[act]} {[cost01]}, remove any number of Fable counters: +X/+X. X is how many were removed.
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush", "aura"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.addCounters(fx.self, "fable", 1);
        if (fx.game.enteredFrom(fx.self) !== "hand") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    activated(
      {
        playPoints: 1,
        custom: {
          canPay: (g, _c, self) => g.counters(self, "fable") >= 1,
          *pay() {
            /* removed at the start of the effect; nothing else can happen in between */
          },
        },
      },
      {
        *resolve(fx) {
          const n = fx.game.counters(fx.self, "fable");
          const options = Array.from({ length: n }, (_, i) => ({ id: String(i + 1), label: String(i + 1) }));
          const [pick] = yield* fx.choose(options);
          const x = Number(pick);
          yield* fx.removeCounters(fx.self, "fable", x);
          yield* fx.giveStats(fx.self, x, x);
        },
      },
    ),
  ],
});
