// BP21-079 Exella, Nocturnal General — Abysscraft follower, 2, 1/3. 魔界.
// Storm.
// Strike - Give this {[attack]}+X. X equals the number of other followers on your field with Storm. (Counted as it resolves.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      *resolve(fx) {
        const g = fx.game;
        const x = g.followers(fx.controller).filter((id) => id !== fx.self && g.hasKeyword(id, "storm")).length;
        if (x > 0 && g.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, x, 0);
      },
    }),
  ],
});
