// BP10-072 Tropical Grouper — Dragoncraft follower, 1, 1/1. 海洋.
// Ward.
// At the start of your end phase, if there's an evolved follower on your field, search your deck for a
// Tropical Grouper, reveal it, add it to your hand, then shuffle.
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { isEvolved, named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    atStartOfYourEndPhase({
      condition: (g, p) => g.followers(p).some((id) => isEvolved(g, id)),
      *resolve(fx) {
        yield* fx.search((id) => named("Tropical Grouper")(fx.game, id));
      },
    }),
  ],
});
