// BP15-055 Crystal Witch — Runecraft follower, 3, 1/2. 魔法使い.
// This costs 2 less to play if there are at least 2 Mage followers on your field.
// ----------
// {[fanfare]} Draw a card. Discard a card.
import { defineCard, fanfare } from "../helpers";
import { mage } from "./shared";

export default defineCard({
  playCost: (g, _self, p) => (g.followers(p).filter((id) => mage(g, id)).length >= 2 ? -2 : 0),
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
