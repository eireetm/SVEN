// CP02-029 Nao Kamiya — Swordcraft follower, 2, 2/3. デレマス・クール.
// {[fanfare]} If there are at least 3 iM@S CG followers on your field, select an enemy follower on the field and deal it 2
// damage. (This follower counts.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { followersOnYourField, imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, c) => followersOnYourField(g, c, imas) >= 3,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
