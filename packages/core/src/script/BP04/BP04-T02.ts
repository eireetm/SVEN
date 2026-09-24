// BP04-T02 Goblin King — Neutral follower token, 4, 6/6. ゴブリン.
// Ward.
// {[fanfare]} Give each other Goblinoid follower on your field +1/+1 (any follower with the ゴブリン
// trait, e.g. Goblin Princess — ruling).
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) {
          if (id !== fx.self && hasTrait("ゴブリン")(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});
