// BP06-078 Bear Pelt Warrior — Abysscraft follower, 4, 5/4. 獣.
// Rush.
// Strike: Deal 1 damage to each leader.
// {[lastwords]} Give your leader {[defense]}+4.
import { defineCard, lastWords, strike } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(fx.controller), fx.game.leader(fx.game.opponent(fx.controller))], 1);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
