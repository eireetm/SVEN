// BP03-110 Rapunzel — Neutral follower, 3, 4/5. プリンセス・童話.
// Ward.
// If this follower has no Fable counters, it can't attack enemies (CR 8.4.3.2.1).
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  cannotAttack: (g, self) => g.counters(self, "fable") === 0,
});
