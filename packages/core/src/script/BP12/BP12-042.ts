// BP12-042 Chaos Wielder — Runecraft follower, 2, 1/2. 魔法使い・禁忌.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]}, Spellchain (5) - Recover 2 play points.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => g.spellchain(p, 5),
      *resolve(fx) {
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
