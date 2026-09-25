// BP09-084 Death the Nyctophile — Abysscraft follower, 6, 5/6. 死者.
// Rush.
// {[lastwords]} Select an enemy follower on the field. Destroy it and deal 3 damage to its leader.
import { defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 3);
      },
    }),
  ],
});
