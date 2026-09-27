// ECP01-039 Daiichi Ruby — Abysscraft follower, 6, 2/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Select up to 1 Umamusume follower that costs 4 or less and up to 1 Umamusume follower that costs 2 or less in your
// cemetery and summon them engaged. (元のコスト; two different cards.)
// Whenever another Umamusume follower is put from your field into the cemetery, deal 1 damage to each enemy leader and give your
// leader {[defense]}+1. (Destroyed too; each copy triggers, also for followers leaving with it — rulings.)
import { defineCard, fanfare, serveAbility, whenYourFollowerLeaves } from "../helpers";
import { costAtMost, inYourZone } from "../targets";
import { umamusumeFollower } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [
        inYourZone("cemetery", { upTo: true, filter: (g, id) => umamusumeFollower(g, id) && costAtMost(4)(g, id) }),
        inYourZone("cemetery", { upTo: true, distinct: true, filter: (g, id) => umamusumeFollower(g, id) && costAtMost(2)(g, id) }),
      ],
      *resolve(fx) {
        yield* fx.putOntoField([...fx.targets[0]!, ...fx.targets[1]!], fx.controller, { engaged: true });
      },
    }),
    whenYourFollowerLeaves(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { to: "cemetery", another: true, filter: (m) => m.before?.traits?.includes("ウマ娘") ?? false },
    ),
  ],
});
