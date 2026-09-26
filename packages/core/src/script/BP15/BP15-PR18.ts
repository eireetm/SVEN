// BP15-PR18 Ravenous Sweetness — Neutral spell token, 5. 絶傑.
// Deal 2 damage to each enemy leader. Give your leader {[defense]}+2. Draw 2 cards. Each opponent discards 2 random
// cards.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamage(fx.game.leader(opp), 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(2);
        yield* fx.discardRandom(2, opp);
      },
    }),
  ],
});
