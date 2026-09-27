// CP03-056 Dynamite Juggler — Runecraft follower, 2, 2/3. ヴァンガード・ペイルムーン. Critical Trigger.
// {[fanfare]} Banish the top card of your deck. If there are at least 5 cards in your banished zone, deal 2 damage to each
// enemy leader. (The card just banished counts — ruling.)
// ----------
// (If this card is revealed by a drive check, give a follower on your field {[attack]}+2.) (Resolved by the engine.)
import { defineCard, fanfare } from "../helpers";
import { countIn, damageEnemyLeader } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.banish(fx.topCards(1));
        if (countIn(fx.game, fx.controller, "banished") >= 5) yield* damageEnemyLeader(fx, 2);
      },
    }),
  ],
});
