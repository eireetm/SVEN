// BP04-019 Ivy Spellbomb — Forestcraft spell, 3. エルフ族.
// Select an enemy follower on the field and deal it 5 damage. Combo (3): Deal 3 damage to its
// leader. (Without an enemy follower it cannot be played at all — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 5);
        if (fx.game.combo(fx.controller, 3)) yield* fx.dealDamage(leader, 3);
      },
    }),
  ],
});
