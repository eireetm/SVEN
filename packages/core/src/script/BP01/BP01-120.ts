// BP01-120 Spartoi Sergeant — Abysscraft follower, 2, 2/3.
// {[fanfare]} Put the top 2 cards of your deck into your cemetery. (As many as there are — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
  ],
});
