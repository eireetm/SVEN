// CSD02a-001 Uzuki Shimamura [P.C.S.] — Swordcraft follower, 7, 4/4. デレマス・キュート.
// {[fanfare]} Select up to 1 Cute follower that costs 4 or less and up to 1 Cute follower that costs 2 or less in your cemetery.
// Summon them and give them {[attack]}+1/{[defense]}+1. (元のコスト; their Fanfares resolve in any order — ruling.)
// Activate, Lesson (1): Give your leader {[defense]}+3. Activate only once per turn.
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { cute, followerThat } from "../CP02/shared";

const cuteFollower = followerThat(cute);

export default defineCard({
  abilities: [
    fanfare({
      targets: [
        inYourZone("cemetery", { upTo: true, filter: and(cuteFollower, costAtMost(4)) }),
        inYourZone("cemetery", { upTo: true, distinct: true, filter: and(cuteFollower, costAtMost(2)) }),
      ],
      *resolve(fx) {
        const summoned = yield* fx.putOntoField(fx.targets.flat());
        for (const id of summoned) if (fx.game.card(id)?.zone === "field") yield* fx.giveStats(id, 1, 1);
      },
    }),
    activated(
      { custom: lesson(1) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 3);
        },
      },
    ),
  ],
});
