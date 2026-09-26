// BP19-114 Zerael, Regent of Vicissitude — Neutral advanced follower, 9, 9/9. 八獄・大神.
// Ward. Aura.
// {[fanfare]} Destroy each enemy follower on the field.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward", "aura"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.destroy(fx.game.followers(fx.game.opponent(fx.controller)));
      },
    }),
  ],
});
