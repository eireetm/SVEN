// CP01-079 Riko Kashimoto [Planned Perfection] — Neutral follower, 6, 6/6. トレセン学園.
// Rush.
// Strike: If there are no other followers on your field, select an enemy follower on the field. Destroy it and deal 3 damage to
// its leader. (Without a target, none of it — ruling.)
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      condition: (g, c, self) => g.followers(c).every((id) => id === self),
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
