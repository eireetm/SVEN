// BP01-040 Ninja Master — Swordcraft follower, 4, 4/4.
// {[fanfare]} Search your deck for a Ninja card, reveal it, and add it to your hand.
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => hasTrait("忍者")(fx.game, id));
      },
    }),
  ],
});
