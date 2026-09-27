// CP02-069 Ranko Kanzaki — Abysscraft follower, 4, 3/3. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and deal it 2 damage.
// {[act]} {[cost01]}, Lesson (2): Select up to 2 enemy followers on the field and deal them 2 damage.
import { lesson } from "../costs";
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    activated(
      { playPoints: 1, custom: lesson(2) },
      {
        targets: [enemyFollower({ count: 2, upTo: true })],
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.targets[0] ?? [], 2);
        },
      },
    ),
  ],
});
