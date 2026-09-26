// BP12-T03 Armored Tentacle — Runecraft follower token, 3, 2/4. 機械・超克.
// Ward.
// {[lastwords]} Give your leader {[defense]}+4.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
