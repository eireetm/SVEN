// BP15-054 Hermit of Destruction — Runecraft follower, 1, 2/2. 絶傑・アイドル.
// {[fanfare]} Select an enemy follower on the field and, if there are at least 3 Idolatry cards on your field, deal
// it 3 damage. (This one counts.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, idolatry } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "field", idolatry) >= 3) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
