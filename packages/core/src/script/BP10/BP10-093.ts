// BP10-093 VIII. Sofina, Strength (Evolved) — Havencraft follower, 3/6. アルカナ・先導.
// Ward.
// If a follower on your field would take more than 3 damage, it takes 3 instead.
// On Evolve - Search your deck for a Somnolent Strength, summon it, then shuffle.
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";
import { sofinaCap } from "./shared";

export default defineCard({
  keywords: ["ward"],
  field: { damageToFollower: sofinaCap },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named("Somnolent Strength")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
