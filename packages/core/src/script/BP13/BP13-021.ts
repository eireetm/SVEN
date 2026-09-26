// BP13-021 Magna Zero — Swordcraft follower, 7, 5/5. 機械・超克・マグナ・キラー.
// {[fanfare]} Banish the top 10 cards of your deck. Deal 5 damage to each enemy leader and enemy follower on
// the field. If there are at least 20 cards in your banished zone, deal 10 damage instead. If there are at
// least 30, deal 20 damage instead. (As many as the deck has; not a loss with fewer — ruling.)
import { defineCard, fanfare } from "../helpers";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.banish(fx.topCards(10));
        const banished = countIn(fx.game, fx.controller, "banished", () => true);
        const amount = banished >= 30 ? 20 : banished >= 20 ? 10 : 5;
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], amount);
      },
    }),
  ],
});
