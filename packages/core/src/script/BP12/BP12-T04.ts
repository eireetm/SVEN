// BP12-T04 Assault Tentacle — Runecraft follower token, 3, 4/2. 機械・超克.
// Storm.
// {[lastwords]} Select an enemy follower on the field and deal it 4 damage.
import { defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
