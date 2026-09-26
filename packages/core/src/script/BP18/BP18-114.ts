// BP18-114 Heavenly Hound — Havencraft follower, 2, 3/2. 信仰・獣.
// Ward.
// {[fanfare]} If there's another follower on your field with Ward, give this {[defense]}+1.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const other = fx.game.followers(fx.controller).some((id) => id !== fx.self && fx.game.hasKeyword(id, "ward"));
        if (other && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 0, 1);
      },
    }),
  ],
});
