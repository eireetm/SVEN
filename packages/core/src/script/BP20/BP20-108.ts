// BP20-108 Featherfolk Courier — Havencraft follower, 5, 3/4. 鳥族.
// Storm.
// Strike - Draw a card.
// {[fanfare]} {[cost02]} Search your deck for a follower with Storm and 3 or less attack, summon it, then shuffle. (CR
// 10.4.7.4; its attack in the deck, printed.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare, strike } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && g.hasKeyword(id, "storm") && (g.info(id).attack ?? Infinity) <= 3, { to: "field" });
      },
    }),
  ],
});
