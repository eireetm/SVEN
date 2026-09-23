// BP01-136 Prism Priestess (Evolved) — 2/2.
// On Evolve: Search your deck for an amulet, reveal it, and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => isAmulet(fx.game, id));
      },
    }),
  ],
});
