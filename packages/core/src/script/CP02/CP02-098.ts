// CP02-098 Shizuku Oikawa — Havencraft follower, 3, 2/5. デレマス・パッション.
// {[fanfare]} Give your leader {[defense]}+2. If there are at least 5 Passion cards in your cemetery, give {[defense]}+4 instead.
import { defineCard, fanfare } from "../helpers";
import { inYourCemetery, passion } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, inYourCemetery(fx.game, fx.controller, passion) >= 5 ? 4 : 2);
      },
    }),
  ],
});
