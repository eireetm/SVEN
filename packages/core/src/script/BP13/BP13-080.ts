// BP13-080 Silversteel Blader — Abysscraft follower, 2, 2/2. 死者・キラー.
// Storm.
// {[fanfare]} If there's an evolved follower on your field, give this follower {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare } from "../helpers";
import { isEvolved } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      condition: (g, p) => g.followers(p).some((id) => isEvolved(g, id)),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
