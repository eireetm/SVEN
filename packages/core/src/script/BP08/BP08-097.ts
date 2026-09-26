// BP08-097 Malevolent Al-mi'raj — Havencraft follower, 2, 2/3. 狂信・獣・キラー.
// Ward. Fanfare: mill your top card; if it was a follower with Ward, this gains Bane. The moved
// card is the new cemetery object (CR 4.1.4.1, 5.34, 12.12).
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const [milled] = yield* fx.mill(1);
        if (milled !== undefined && isFollower(fx.game, milled) && fx.game.hasKeyword(milled, "ward")) {
          yield* fx.giveKeyword(fx.self, "bane");
        }
      },
    }),
  ],
});
