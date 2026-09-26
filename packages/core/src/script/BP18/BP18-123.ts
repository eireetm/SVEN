// BP18-123 A-Class Pyromancy — Neutral spell, 1. 透京・区役所.
// {[quick]}
// Select an enemy follower on the field. Deal it 2 damage and, if there's a Saito, Mao Ward Officer on your field, deal 1
// damage to its leader. (Not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 2);
        if (fx.game.followers(fx.controller).some((id) => named("Saito, Mao Ward Officer")(fx.game, id))) yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
