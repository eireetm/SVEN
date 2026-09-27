// CP01-078 T.M. Opera O — Havencraft follower, 7, 6/6. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Select an enemy follower on the field. Banish it and draw a card.
import { defineCard, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
  ],
});
