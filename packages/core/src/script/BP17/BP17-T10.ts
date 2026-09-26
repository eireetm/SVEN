// BP17-T10 Eschamali Constable — Havencraft follower token, 2, 2/2. 信仰.
// Rush.
// {[fanfare]} Give your leader {[defense]}+2.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
