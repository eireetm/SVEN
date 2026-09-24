// BP02-019 Albert, Levin Saber (Evolved) — 3/5.
// Storm.
// On Evolve: For the rest of this turn, this follower doesn't take combat damage.
// Strike: Refresh this follower. Perform this ability only once per turn.
// (Combat damage: CR 5.14.3.2; once per turn per card — ruling; CR 10.7.2.2, 5.4.)
import { defineCard, onEvolve, strike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.preventDamage(fx.self, "combat", "endOfTurn");
      },
    }),
    strike({
      oncePerTurn: true,
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
