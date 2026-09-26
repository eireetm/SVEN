// BP14-038 Riley, Astral Shaman (Evolved) — Runecraft follower, 3/3. 魔法使い.
// On Evolve - Search your deck for a follower with Earth Rite that costs X or less, summon it, then shuffle.
// X equals your max play points. (元のコスト; Riley itself has no Earth Rite — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const x = g.state.players[fx.controller].maxPlayPoints;
        yield* fx.search((id) => isFollower(g, id) && g.hasEarthRite(id) && (g.info(id).cost ?? Infinity) <= x, { to: "field" });
      },
    }),
  ],
});
