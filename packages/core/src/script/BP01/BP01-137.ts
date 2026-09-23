// BP01-137 Cleric Lancer — Havencraft follower, 4, 1/5.
// Ward. // During each opponent's turn, this follower deals 4 more damage.
// (A replacement effect on damage it deals, CR 5.14.2; with Laelia: defense + 4 — ruling.)
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  field: { damageDealt: (g, self) => (g.activePlayer !== g.controller(self) ? 4 : 0) },
});
