// BP16-T05 Coco, Left Paw Hellhound — Abysscraft follower token, 1, 2/2. 魔界.
// {[lastwords]} Give your leader {[defense]}+2. Bury the top card of your deck.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.mill(1);
      },
    }),
  ],
});
