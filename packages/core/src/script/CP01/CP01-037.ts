// CP01-037 Nakayama Festa — Runecraft follower, 9, 7/7. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Deal 5 damage to each enemy leader and enemy follower on the field. Discard your hand. (Also with no cards in
// hand — ruling.)
import { defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const opponent = g.opponent(fx.controller);
        yield* fx.dealDamageEach([g.leader(opponent), ...g.followers(opponent)], 5);
        yield* fx.discardHand();
      },
    }),
  ],
});
