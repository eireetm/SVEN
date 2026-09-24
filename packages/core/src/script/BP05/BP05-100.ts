// BP05-100 The Saviors — Havencraft spell, 1. 絶傑・狂信.
// Choose one of the following. (1) Search your deck for a Marwynn, Omen of Repose, reveal it, add it
// to your hand, then shuffle your deck. (2) Select an enemy follower with 2 defense or less on the
// field and banish it.
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "search",
          label: "Search for a Marwynn, Omen of Repose",
          *resolve(fx) {
            yield* fx.search((id) => named("Marwynn, Omen of Repose")(fx.game, id));
          },
        },
        {
          id: "banish",
          label: "Banish an enemy follower with 2 defense or less",
          targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 2 })],
          *resolve(fx) {
            yield* fx.banish(fx.targets[0] ?? []);
          },
        },
      ],
    }),
  ],
});
