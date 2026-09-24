// BP04-087 Fenrir — Abysscraft follower, 4, 3/5. 魔界.
// {[evolve]} {[cost01]}: Evolve this follower.
// During your turn, whenever this follower takes damage, select an enemy follower on the field and
// deal it 3 damage. (Defense -1 is not damage; damage that destroys it still triggers it, and it
// resolves after the destruction — rulings.)
import { defineCard, evolveAbility, whenThisTakesDamage } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    whenThisTakesDamage(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
