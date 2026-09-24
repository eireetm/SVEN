// BP04-117 Israfil — Neutral follower, 8, 8/8. 天使・大神.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Give your leader +4 defense.
// Strike: Deal 3 damage to each enemy follower on the field.
import { defineCard, evolveAbility, fanfare, strike } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
