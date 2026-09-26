// BP17-088 Trampling Terror — Abysscraft follower, 6, 4/5. 魔界.
// {[fanfare]} Select an enemy follower on the field and destroy it.
// {[lastwords]} Deal 3 damage to each enemy leader.
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
