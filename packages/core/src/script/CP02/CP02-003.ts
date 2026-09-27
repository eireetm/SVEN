// CP02-003 Miku Maekawa — Forestcraft follower, 2, 3/1. デレマス・キュート.
// Strike - Select an enemy follower on the field and deal it 2 damage.
// {[act]} {[cost01]}, Lesson (1): Give this follower Storm. (Lesson: banish a Magical Item from your EX area, CR 14.3.2.1.)
import { lesson } from "../costs";
import { activated, defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    activated(
      { playPoints: 1, custom: lesson(1) },
      {
        *resolve(fx) {
          yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
