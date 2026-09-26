// BP20-073 Raging Lightning — Dragoncraft spell, 4. 竜族.
// {[quick]}
// Select an enemy follower on the field. Deal it 6 damage and, if you selected a follower with 3 or less defense, deal 3
// damage to its leader. (Its defense when selected; nothing happens between selecting and resolving, CR 10.6.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const low = (fx.game.statsOf(target).defense ?? Infinity) <= 3;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 6);
        if (low) yield* fx.dealDamage(leader, 3);
      },
    }),
  ],
});
