// BP14-090 Shion, Immortal Aegis — Havencraft follower, 6, 3/7. 信仰・超克.
// Ward.
// This can't be destroyed by abilities.
// If this or your leader would take damage, they take that much minus 1 instead. (A replacement, CR 5.14.2: two
// Shions give -2; with other changes the affected player orders them, CR 10.10.2; "-X defense" isn't damage —
// rulings.)
// {[fanfare]} Put a Mercurial Might token into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  cannotBeDestroyedByAbilities: true,
  field: {
    damageTaken: () => -1,
    damageToLeader: (g, self, d) => (g.controller(d.target) === g.controller(self) ? -1 : 0),
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Mercurial Might"]);
      },
    }),
  ],
});
