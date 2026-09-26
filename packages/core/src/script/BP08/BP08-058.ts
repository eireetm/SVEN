// BP08-058 Powerforge — Dragoncraft spell, 1. 竜族・キラー.
// Select an enemy follower and a follower on your field or in your EX area. Deal the former damage
// equal to the latter's attack. Both targets are required (rulings, CR 5.14, 10.6.2.3).
import { defineCard, spell } from "../helpers";
import { enemyFollower, isFollower, yourFieldOrEx } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower(), yourFieldOrEx({ filter: isFollower })],
      *resolve(fx) {
        const source = fx.targets[1]![0]!;
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.info(source).attack ?? 0);
      },
    }),
  ],
});
