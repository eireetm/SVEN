// BP13-081 Soulstrike — Abysscraft spell, 2. 荒野・死者.
// Select an enemy follower on the field and deal it 4 damage. Necrocharge (20) - Deal 4 damage to its
// leader. (While it resolves, this card is not in the cemetery, CR 13.5.1.3.1.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const nc = fx.game.necrocharge(fx.controller, 20); // CR 13.5.1.3.2
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 4);
        if (nc) yield* fx.dealDamage(leader, 4);
      },
    }),
  ],
});
