// BP12-084 Ghoul — Abysscraft follower, 2, 2/3. 死者.
// {[fanfare]} Bury another Departed follower: Draw 2 cards. Discard a card.
import { defineCard, fanfare } from "../helpers";
import { buryAnotherFromYourField } from "../costs";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: buryAnotherFromYourField(and(isFollower, hasTrait("死者"))),
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
