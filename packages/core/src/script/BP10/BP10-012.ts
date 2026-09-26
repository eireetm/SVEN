// BP10-012 Lumbering Carapace — Forestcraft follower, 1, 2/1. 虫族.
// Rush.
// {[fanfare]}, Combo (3) - Search your deck for a Lumbering Carapace, reveal it, add it to your hand,
// then shuffle.
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      condition: (g, p) => g.combo(p, 3),
      *resolve(fx) {
        yield* fx.search((id) => named("Lumbering Carapace")(fx.game, id));
      },
    }),
  ],
});
