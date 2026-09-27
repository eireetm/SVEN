// CP01-048 Bamboo Memory — Dragoncraft follower, 2, 2/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Discard a card: Deal 2 damage to each enemy leader. (CR 10.4.7.4.)
import { discardCardsCost } from "../costs";
import { defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: discardCardsCost(1),
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
      },
    }),
  ],
});
