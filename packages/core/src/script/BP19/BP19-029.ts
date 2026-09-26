// BP19-029 Storm-Wracked First Mate (Evolved) — 3/3.
// On Evolve - Search your deck for a follower with both the Condemned and Thief traits, reveal it, add it to your hand, then
// shuffle.
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";
import { condemned, thief } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && condemned(fx.game, id) && thief(fx.game, id));
      },
    }),
  ],
});
