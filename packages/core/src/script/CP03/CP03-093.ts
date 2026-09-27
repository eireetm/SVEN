// CP03-093 Black Sage, Charon — Abysscraft follower, 1, 2/2. ヴァンガード・シャドウパラディン.
// {[fanfare]} Bury the top card of your deck.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
