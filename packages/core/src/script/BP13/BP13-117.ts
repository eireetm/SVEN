// BP13-117 Armored Goblin (Evolved) — Neutral follower, 3/3. ゴブリン.
// Ward.
// On Evolve - The next time this follower would take damage this turn, it doesn't. (Stat changes aren't
// damage, and 0 damage doesn't use it up — rulings.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.preventNextDamage(fx.self, "endOfTurn");
      },
    }),
  ],
});
