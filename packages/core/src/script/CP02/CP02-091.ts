// CP02-091 Akane Hino — Havencraft follower, 5, 5/5. デレマス・パッション.
// Rush. Assail.
// Strike - Deal 2 damage to each enemy leader.
// {[act]} {[cost02]}, Lesson (1): Give this follower Storm.
import { lesson } from "../costs";
import { activated, defineCard, strike } from "../helpers";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 2);
      },
    }),
    activated(
      { playPoints: 2, custom: lesson(1) },
      {
        *resolve(fx) {
          yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
