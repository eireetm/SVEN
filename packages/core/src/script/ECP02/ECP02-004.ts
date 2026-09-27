// ECP02-004 Minami Nitta [Water's Edge Bride] — Forestcraft follower, 3, 3/3. デレマス・クール.
// {[fanfare]} Search your deck for a follower with "Anastasia" in its name, put it into your EX area, then shuffle. It costs 3
// less to play this turn.
// {[act]} Lesson (1), {[engage]}: Select an enemy follower on the field and engage it. It doesn't refresh during its controller's
// next start phase. (The engage cost is in the Japanese and official English texts, not in this printing's English. An engaged
// follower can be selected: it just doesn't refresh — ruling.)
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { followerNamed, searchIntoExCheaper } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* searchIntoExCheaper(fx, followerNamed("Anastasia"), 3);
      },
    }),
    activated(
      { engageSelf: true, custom: lesson(1) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.engage([target]);
          yield* fx.skipNextRefresh(target);
        },
      },
    ),
  ],
});
