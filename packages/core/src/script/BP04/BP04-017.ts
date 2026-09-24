// BP04-017 Dryad — Forestcraft follower, 2, 2/3. 精霊・植物族.
// Strike: Select an enemy follower on the field and give it -1 attack. (Attack can go below 0; a
// follower with 0 or less attack deals no damage — ruling.)
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -1, 0);
      },
    }),
  ],
});
