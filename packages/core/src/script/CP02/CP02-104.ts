// CP02-104 New Wave — Neutral follower, 6, 7/7. デレマス・キュート・クール・パッション.
// {[fanfare]}, Lesson (5): Destroy each enemy card on the field. (A cost of the Fanfare, CR 10.4.7.4, 14.3.2.1.)
import { lesson } from "../costs";
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      cost: lesson(5),
      *resolve(fx) {
        yield* fx.destroy(fx.game.cards(fx.game.opponent(fx.controller), "field"));
      },
    }),
  ],
});
