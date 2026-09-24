// BP05-020 Magna Legacy — Swordcraft follower, 8, 8/8. 超克・マグナ.
// {[fanfare]} Banish the top half of your deck (round up). Deal 4 damage to each enemy leader and
// enemy follower on the field. If at least 15 cards were banished by this ability, deal 8 damage
// instead. (Faceup, in deck order — rulings.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const deck = fx.game.cards(fx.controller, "deck");
        const banished = yield* fx.banish(deck.slice(0, Math.ceil(deck.length / 2)));
        const opponent = fx.game.opponent(fx.controller);
        const damage = banished.length >= 15 ? 8 : 4;
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], damage);
      },
    }),
  ],
});
