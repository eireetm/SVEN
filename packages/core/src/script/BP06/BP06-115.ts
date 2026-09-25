// BP06-115 Chaht, Ringside Announcer (Evolved) — Neutral follower, 4/4. 挑戦者.
// On Evolve - Search your deck for an Arena card, reveal it, add it to your hand, then shuffle your
// deck.
import { defineCard, onEvolve } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => hasTrait("挑戦者")(fx.game, id));
      },
    }),
  ],
});
