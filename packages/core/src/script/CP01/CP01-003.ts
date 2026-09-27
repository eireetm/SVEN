// CP01-003 Smart Falcon — Forestcraft follower, 5, 5/5. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Return any number of other Umamusume cards on your field to their owners' hands: Deal X damage to each enemy
// follower on the field. X equals 2 times the number of cards returned. (Your own cards only; an evolved or racing
// follower counts once — rulings; CR 10.4.7.4.)
import { defineCard, fanfare, serveAbility } from "../helpers";
import { returnedCount, returnOtherUmamusume } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: returnOtherUmamusume,
      *resolve(fx) {
        const x = 2 * returnedCount(fx.memory);
        if (x > 0) yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), x);
      },
    }),
  ],
});
