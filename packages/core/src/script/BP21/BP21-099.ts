// BP21-099 Orchid's Examination Hall — Havencraft amulet, 2. 信仰・学院・光輝.
// Activate {[engage]} this: Select an Academic follower on your field and give it {[attack]}+1/{[defense]}+1. Activate only if
// your leader gained {[defense]} this turn.
// {[act]} {[cost01]}, discard an Academic amulet: Search your deck for a 1-cost Academic follower, reveal it, add it to your
// hand, then shuffle. Activate only once per turn. (元のコスト.)
import { discardA } from "../costs";
import { activated, defineCard } from "../helpers";
import { isAmulet, yourFollower } from "../targets";
import { academic, academicFollower } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.leaderDefenseGainedThisTurn(c) > 0,
        targets: [yourFollower({ filter: academicFollower })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      },
    ),
    activated(
      { playPoints: 1, custom: discardA((g, id) => isAmulet(g, id) && academic(g, id)) },
      {
        timesPerTurn: 1,
        *resolve(fx) {
          yield* fx.search((id) => academicFollower(fx.game, id) && fx.game.info(id).cost === 1, { to: "hand" });
        },
      },
    ),
  ],
});
