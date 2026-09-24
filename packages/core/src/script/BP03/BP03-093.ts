// BP03-093 Odette, White Swan — Havencraft follower, 5, 4/6. 信仰・童話.
// {[fanfare]} +2 defense to your leader and each other follower on your field.
// {[lastwords]} +2 defense to your leader and each follower on your field.
import { defineCard, fanfare, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        for (const id of fx.game.followers(fx.controller)) {
          if (id !== fx.self) yield* fx.giveStats(id, 0, 2);
        }
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 0, 2);
      },
    }),
  ],
});
