// BP19-107 Sword Al-mi'raj — Havencraft follower, 5, 3/6. 獣.
// Storm.
// At the start of your end phase, select a follower on your field and change its defense to its original defense.
// (CR 5.24.1 printed defense; see changeStatsTo.)
import { atStartOfYourEndPhase, changeStatsTo, defineCard } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    atStartOfYourEndPhase({
      targets: [yourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const defense = fx.game.card(target)?.zone === "field" ? fx.game.originalStats(target).defense : null;
        if (defense !== null) yield* changeStatsTo(fx, target, { defense });
      },
    }),
  ],
});
