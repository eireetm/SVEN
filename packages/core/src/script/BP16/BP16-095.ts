// BP16-095 Rodeo, Anathema of Judgment (Evolved) — Havencraft follower, 4/5. アナテマ・先導.
// On Evolve - Search your deck for an amulet that costs 3 or less, summon it, then shuffle.
// On Super-Evolve - Search your deck for an amulet that costs 5 or less, summon it, then shuffle. (元のコスト; BP16-093
// Lapis too — ruling.)
// At the start of your end phase, if there are at least 2 amulets on your field, give your leader {[defense]}+2.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { and, costAtMost, isAmulet } from "../targets";
import { rodeoBlessing } from "./shared-haven";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => and(isAmulet, costAtMost(3))(fx.game, id), { to: "field" });
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.search((id) => and(isAmulet, costAtMost(5))(fx.game, id), { to: "field" });
      },
    }),
    rodeoBlessing,
  ],
});
