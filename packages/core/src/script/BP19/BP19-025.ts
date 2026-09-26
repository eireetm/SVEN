// BP19-025 Warden of Honor (Evolved) — 4/5.
// Ward.
// On Evolve - Choose 1. (1) Search your deck for a Warden of Honor, summon it, then shuffle. (2) {[cost03]}: Search your deck
// for a Radiel, Valorous Enforcer, summon it, then shuffle. ((2)'s cost is asked as it resolves, CR 10.4.7.5.)
import { playPointsCost } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      modes: [
        {
          id: "warden",
          label: "(1) A Warden of Honor from your deck onto the field",
          *resolve(fx) {
            yield* fx.search((id) => named("Warden of Honor")(fx.game, id), { to: "field" });
          },
        },
        {
          id: "radiel",
          label: "(2) (3): A Radiel, Valorous Enforcer from your deck onto the field",
          cost: playPointsCost(3),
          *resolve(fx) {
            yield* fx.search((id) => named("Radiel, Valorous Enforcer")(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
