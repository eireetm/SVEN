// BP11-100 Sacred Stone Apostle — Havencraft follower, 1, 1/2. 信仰.
// {[fanfare]} If there's an amulet on your field, give this follower {[attack]}+1/{[defense]}+1.
// Strike - Draw a card. Discard a card.
import { defineCard, fanfare, strike } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => g.cards(p, "field").some((id) => isAmulet(g, id)),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
