// CP02-064 Noriko Shiina — Dragoncraft follower, 2, 2/3. デレマス・キュート.
// {[fanfare]} If there are at least 3 iM@S CG followers on your field, give this follower {[attack]}+1 and Rush. (This follower
// counts.)
// Strike - Give your leader {[defense]}+2.
import { defineCard, fanfare, strike } from "../helpers";
import { followersOnYourField, imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, c) => followersOnYourField(g, c, imas) >= 3,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
