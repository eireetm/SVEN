// BP05-082 Servant of Silence — Abysscraft follower, 2, 2/3. 絶傑・死霊術師.
// Whenever an opponent discards a card, deal 2 damage to their leader and put the top 2 cards of
// your deck into your cemetery. (Once per card — ruling.)
import { defineCard, whenOpponentDiscards } from "../helpers";

export default defineCard({
  abilities: [
    whenOpponentDiscards({
      *resolve(fx) {
        const player = fx.data?.player ?? fx.game.opponent(fx.controller);
        yield* fx.dealDamage(fx.game.leader(player), 2);
        yield* fx.mill(2);
      },
    }),
  ],
});
