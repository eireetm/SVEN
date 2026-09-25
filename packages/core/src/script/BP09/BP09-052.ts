// BP09-052 Jerva of Draconic Mail — Dragoncraft follower, 5, 5/5. 竜使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Discard your hand.
// At the start of your end phase, deal 5 damage to each other follower on the field and draw a card.
// (Several of them resolve one by one in any order; one destroyed by another still resolves —
// rulings, CR 10.7.7.)
import { atStartOfYourEndPhase, defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.discardHand();
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        const others = [...fx.game.followers(0), ...fx.game.followers(1)].filter((id) => id !== fx.self);
        yield* fx.dealDamageEach(others, 5);
        yield* fx.draw(1);
      },
    }),
  ],
});
