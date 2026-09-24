// BP05-028 Geno, Machine Artisan (Evolved) — Swordcraft follower, 3/3. 指揮官・超克.
// On Evolve: Search your deck for an amulet, reveal it, add it to your hand, then shuffle your deck.
// Whenever you play an amulet, select a follower on your field and give it {[defense]}+1.
import { defineCard, onEvolve } from "../helpers";
import { isAmulet } from "../targets";
import { genoAmuletPlayed } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => isAmulet(fx.game, id));
      },
    }),
    genoAmuletPlayed,
  ],
});
