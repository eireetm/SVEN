// BP02-052 Imperial Dragoon — Dragoncraft follower, 8, 6/6.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]} Deal X damage to each enemy leader and enemy follower on the field. X equals the
// number of cards in your hand. Discard your hand. (No cost: the hand is always discarded, even with
// no enemy follower — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        const x = fx.game.cards(fx.controller, "hand").length;
        yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], x);
        yield* fx.discardHand();
      },
    }),
  ],
});
