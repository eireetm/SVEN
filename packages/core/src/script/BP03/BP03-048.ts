// BP03-048 Gingerbread House — Runecraft amulet, 1. 土の印・童話.
// Stack.
// {[fanfare]} Give your leader +3 defense.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
