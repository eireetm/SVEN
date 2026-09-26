// BP20-099 Sacred Sheep — Havencraft follower, 2, 2/3. 先導.
// At the start of each opponent's main phase, the next time your leader would take damage this turn, it doesn't take damage.
// (Two of these: the next two damages; 0 damage doesn't use it up — rulings.)
import { atStartOfOpponentsMainPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfOpponentsMainPhase({
      *resolve(fx) {
        yield* fx.preventNextDamage(fx.game.leader(fx.controller), "endOfTurn");
      },
    }),
  ],
});
