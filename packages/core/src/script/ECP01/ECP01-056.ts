// ECP01-056 Balliamo? — Neutral spell, 2. ウマ娘.
// Search your deck for an Umamusume follower, reveal it, add it to your hand, then shuffle.
import { defineCard, spell } from "../helpers";
import { umamusumeFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.search((id) => umamusumeFollower(fx.game, id));
      },
    }),
  ],
});
