// SD06-010 Ardent Nun (Evolved) — 3/3.
// Ward.
// During each opponent's turn, this follower deals 2 more damage.
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  field: { damageDealt: (g, self) => (g.activePlayer !== g.controller(self) ? 2 : 0) },
});
