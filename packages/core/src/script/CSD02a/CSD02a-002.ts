// CSD02a-002 Kyoko Igarashi [P.C.S.] — Swordcraft follower, 4, 4/4. デレマス・キュート.
// Ward.
// {[fanfare]} Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1 for every Cute follower on your field.
// (X is counted when it resolves; this follower counts.)
// Activate, Lesson (1): Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1. Activate only once per turn.
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { cute, followersOnYourField } from "../CP02/shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const x = followersOnYourField(fx.game, fx.controller, cute);
        if (x > 0) yield* fx.giveStats(fx.targets[0]![0]!, -x, -x);
      },
    }),
    activated(
      { custom: lesson(1) },
      {
        oncePerTurn: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
        },
      },
    ),
  ],
});
