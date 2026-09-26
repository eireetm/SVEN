// BP08-050 Zealot of Destruction — Runecraft follower, 3, 3/4. 絶傑・アイドル・キラー.
// {[fanfare]} If there are at least 3 Idolatry cards on your field, select an enemy follower on the
// field. Destroy it, deal 2 damage to its leader, and give your leader {[defense]}+2. (This card
// counts itself.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => g.cards(p, "field").filter((id) => hasTrait("アイドル")(g, id)).length >= 3,
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
