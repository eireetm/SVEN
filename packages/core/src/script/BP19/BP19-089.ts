// BP19-089 Steamrolling Tank — Abysscraft follower, 1, 0/2. 八獄・魔界.
// Ward.
// Four times on each of your turns, whenever your leader's defense decreases, give your leader {[defense]}+1. (Per card —
// ruling; CR 10.7.2.2. At 1 defense its own Fanfare still loses the game first — ruling, CR 11.2.)
// {[fanfare]} Deal 1 damage to your leader.
import { defineCard, fanfare, whenYourLeaderLosesDefense } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    {
      ...whenYourLeaderLosesDefense({
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      }),
      timesPerTurn: 4,
      triggerIf: (g, c) => g.activePlayer === c,
    },
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
      },
    }),
  ],
});
