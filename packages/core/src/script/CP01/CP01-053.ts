// CP01-053 Maruzensky — Abysscraft follower, 3, 3/3. ウマ娘.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]}, Necrocharge (10): Select an enemy follower on the field and give it {[attack]}-4/{[defense]}-4. (CR 13.5.1.)
import { defineCard, evolveAbility, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    serveAbility(1, 1),
    fanfare({
      condition: (g, c) => g.necrocharge(c, 10),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -4, -4);
      },
    }),
  ],
});
