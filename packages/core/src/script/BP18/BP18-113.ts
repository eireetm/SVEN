// BP18-113 Armed Al-mi'raj — Havencraft follower, 6, 4/6. 信仰・獣.
// {[fanfare]} Select an enemy follower on the field. Destroy it and give your leader {[defense]}+3. (Without a target nothing
// happens — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
