// CP02-079 My Life, My Sounds — Abysscraft spell, 3. デレマス・パッション.
// Select an enemy follower on the field. Destroy it and, if Sanguine is active for you, deal 2 damage to its leader. (Sanguine
// works in a universe deck too — ruling; CR 13.5.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        if (fx.game.sanguine(fx.controller)) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
