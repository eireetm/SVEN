// BP02-039 Anne, Belle of Mysteria (Evolved) — 4/5.
// On Evolve: Search your deck for an Academic follower with a different name from this card,
// reveal it, and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const name = fx.game.db.get(fx.sourceDef).name;
        yield* fx.search((id) => and(isFollower, hasTrait("学院"))(fx.game, id) && fx.game.info(id).name !== name);
      },
    }),
  ],
});
