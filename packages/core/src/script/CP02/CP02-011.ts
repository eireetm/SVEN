// CP02-011 Goddess by the Sunlit Sea — Forestcraft spell, 1. デレマス・クール.
// Draw a card. If there's a follower that costs 5 or more on your field, recover 1 play point. (元のコスト.)
import { defineCard, spell } from "../helpers";
import { costAtLeast } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        if (fx.game.followers(fx.controller).some((id) => costAtLeast(5)(fx.game, id))) yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
