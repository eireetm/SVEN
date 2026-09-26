// BP19-102 Follower of the Precepts — Havencraft follower, 2, 2/3. 八獄・信仰.
// When playing this, engage an Erralde, Troth Convict on your field: This costs 0 to play.
// At the start of your end phase, select an enemy follower on the field and deal it 1 damage.
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { erraldeOption } from "./shared-haven";

export default defineCard({
  playOptions: [erraldeOption],
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
