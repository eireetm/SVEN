// BP09-022 Prim, Innocent Princess (Evolved) — Swordcraft follower, 2/2. 指揮官・プリンセス.
// On Evolve - Search your deck for a Nonja, Silent Maid, reveal it, add it to your hand, then shuffle
// your deck.
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named("Nonja, Silent Maid")(fx.game, id));
      },
    }),
  ],
});
