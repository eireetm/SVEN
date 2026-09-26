// BP10-022 Alyaska, War Hawker (Evolved) — Swordcraft follower, 5/5. 指揮官・商人.
// On Evolve - Search your deck for an Ernesta, Weapons Hawker, summon it, then shuffle. Put an
// Exterminus Weapon token into your EX area. (Also when Ernesta isn't found — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named("Ernesta, Weapons Hawker")(fx.game, id), { to: "field" });
        yield* fx.tokensToEx(["Exterminus Weapon"]);
      },
    }),
  ],
});
