// BP01-061 Flame Destroyer — Runecraft follower, 9, 7/7.
// Spellchain (5): This card costs 3 less to play. SC (10): It costs 6 less instead. SC (15): It
// costs 9 less instead. (Always applied — ruling; CR 13.3.1.) // Rush.
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  playCost(g, _self, controller) {
    const sc = g.spellsInCemetery(controller);
    return sc >= 15 ? -9 : sc >= 10 ? -6 : sc >= 5 ? -3 : 0;
  },
});
