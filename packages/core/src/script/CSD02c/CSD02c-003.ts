// CSD02c-003 Akane Hino [Positive Passion] — Havencraft follower, 8, 7/7. デレマス・パッション.
// Storm.
// {[fanfare]}, Lesson (3), discard 2 Passion cards: Deal 6 damage to each enemy follower on the field. Draw 2 cards. (CR 10.4.7.4:
// both are paid, or neither.)
import { allCosts, discardMatching, lesson } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { passion } from "../CP02/shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      cost: allCosts(lesson(3), discardMatching(passion, 2)),
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 6);
        yield* fx.draw(2);
      },
    }),
  ],
});
