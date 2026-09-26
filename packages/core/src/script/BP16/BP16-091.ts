// BP16-091 Beryl, Nightmare Incarnate — Abysscraft follower, 4, 5/5. 魔界.
// {[fanfare]} Deal 3 damage to your leader.
// Strike - Give your leader {[defense]}+5.
import { defineCard, fanfare, strike } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 3);
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
  ],
});
