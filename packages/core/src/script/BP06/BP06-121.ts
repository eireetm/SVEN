// BP06-121 Sentry Gate — Neutral amulet, 2. 傭兵.
// Whenever an enemy follower on the field attacks, its controller may pay {[cost02]} to destroy this
// amulet. If they don't pay, deal 2 damage to the follower. (Aura doesn't stop it; a follower
// destroyed by it deals no attack damage — rulings.)
import { defineCard, whenEnemyFollowerAttacks } from "../helpers";

export default defineCard({
  abilities: [
    whenEnemyFollowerAttacks({
      *resolve(fx) {
        const attacker = fx.data?.card;
        const player = fx.data?.player;
        if (attacker === undefined || player === undefined) return;
        if (fx.game.state.players[player].playPoints >= 2 && (yield* fx.confirm(player, fx.self))) {
          yield* fx.payPlayPoints(2, player);
          yield* fx.destroy([fx.self]);
          return;
        }
        yield* fx.dealDamage(attacker, 2);
      },
    }),
  ],
});
