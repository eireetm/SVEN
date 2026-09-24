// BP04-110 Starchaser Sprite — Havencraft follower, 3, 3/4. 信仰・星神.
// {[fanfare]} {[engage]} 2 amulets on your field: Draw 2 cards. Discard a card.
import { defineCard, fanfare } from "../helpers";
import { engageTwoAmulets } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: engageTwoAmulets,
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
