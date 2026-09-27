// CP02-048 Rika Jougasaki (Evolved) — 2/2.
// On Evolve - Search your deck for a spell that costs 3 or less, reveal it, add it to your hand, then shuffle your deck.
// (元のコスト; revealed to the opponent — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isSpell(g, id) && costAtMost(3)(g, id));
      },
    }),
  ],
});
