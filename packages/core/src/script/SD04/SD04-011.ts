// SD04-011 Glint Dragon — Dragoncraft follower, 4, 5/3. 竜族.
// {[fanfare]} Select an enemy follower on the field and deal it 3 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
