// BP18-115 Golden Bell — Havencraft amulet, 1. 信仰.
// {[fanfare]} Draw a card.
// {[act]} {[cost02]}, engage this: Bury this.
// {[lastwords]} Give your leader {[defense]}+1.
import { activated, defineCard, fanfare, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.bury([fx.self]);
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
