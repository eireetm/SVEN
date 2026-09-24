// BP02-032 Avant Blader (Evolved) — 5/5.
// On Evolve: Search your deck for up to 2 Officer followers, reveal them, and add them to your hand.
import { defineCard, onEvolve } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => and(isFollower, hasTrait("兵士"))(fx.game, id), { max: 2 });
      },
    }),
  ],
});
