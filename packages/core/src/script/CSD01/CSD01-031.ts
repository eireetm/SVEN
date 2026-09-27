// CSD01-031 Aoi Kiryuin — Neutral follower, 2, 2/3. トレセン学園.
// Activate {[engage]}: Select an Umamusume follower on your field and give it {[defense]}+1. If it's a racing follower, give it
// {[defense]}+2 instead. (出走したフォロワー: it is racing, CR 14.2.3.)
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";
import { umamusume } from "../CP01/shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [yourFollower({ filter: umamusume })],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          if (fx.game.isRacing(target)) yield* fx.giveStats(target, 0, 2);
          else yield* fx.giveStats(target, 0, 1);
        },
      },
    ),
  ],
});
