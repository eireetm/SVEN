// CP01-014 Tokai Teio — Swordcraft follower, 5, 4/4. ウマ娘.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Select an enemy follower on the field and deal it X damage. X equals 2 times the number of followers on your
// field, including this one. (Counted as it resolves — ruling.)
import { defineCard, evolveAbility, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * fx.game.followers(fx.controller).length);
      },
    }),
  ],
});
