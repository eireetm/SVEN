// BP16-073 Swordsnout Trencher — Dragoncraft follower, 4, 5/5. 竜族・海洋.
// Rush.
// If Overflow is active for you, this has Storm. (A passive: gained and lost as Overflow changes — ruling.)
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  selfKeywords: (g, self) => (g.overflow(g.controller(self)) ? ["storm"] : []),
});
