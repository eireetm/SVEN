// BP09-053 Jerva of Draconic Mail (Evolved) — Dragoncraft follower, 5/5. 竜使い.
// At the start of your end phase, deal 5 damage to each other follower on the field and each enemy
// leader and draw a card.
// (Several of them resolve one by one in any order; one destroyed by another still resolves —
// rulings, CR 10.7.7.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        const others = [...fx.game.followers(0), ...fx.game.followers(1)].filter((id) => id !== fx.self);
        yield* fx.dealDamageEach([...others, fx.game.leader(fx.game.opponent(fx.controller))], 5);
        yield* fx.draw(1);
      },
    }),
  ],
});
