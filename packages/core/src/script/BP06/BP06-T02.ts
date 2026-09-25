// BP06-T02 Paper Shikigami — Runecraft follower token, 2, 2/2. 式神.
// {[lastwords]} Draw a card. Discard a card. (A token's Last Words trigger — ruling.)
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
