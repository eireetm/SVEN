// CP03-007 Hydro Hurricane Dragon — Forestcraft follower, 8, 5/5. ヴァンガード・アクアフォース.
// This card costs 6 less to play if Aqua Force followers on your field have attacked at least 3 times this turn.
// ----------
// Twin Drive.
// {[fanfare]} Select up to 2 enemy followers on the field. Destroy them and, for every follower destroyed this way, deal 1 damage
// to each enemy leader.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { aquaForceAttacks, damageEnemyLeader } from "./shared";

export default defineCard({
  keywords: ["twinDrive"],
  playCost: (g, _self, c) => (aquaForceAttacks(g, c) >= 3 ? -6 : 0),
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        const destroyed = yield* fx.destroy(fx.targets[0] ?? []);
        if (destroyed.length > 0) yield* damageEnemyLeader(fx, destroyed.length);
      },
    }),
  ],
});
