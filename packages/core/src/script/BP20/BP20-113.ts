// BP20-113 Gilnelise, Voracity Manifest — Neutral follower, 3, 3/3. 絶傑.
// Drain.
// Whenever you play a card named Ravenous Sweetness, select an enemy follower on the field and deal it 5 damage.
// {[fanfare]} Select another follower on the field and give it {[attack]}+3/{[defense]}-3. If you don't have a Super Evolution
// Point, put a Ravenous Sweetness token into your EX area. (Without another follower, none of it; SEP starts at 1 — rulings.
// The official English text calls the token "Sweetness of Voracity".)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { anotherFollower, enemyFollower, named } from "../targets";
import { noSuperEvolutionPoint } from "./shared-neutral";

const SWEETNESS = "Ravenous Sweetness";

export default defineCard({
  keywords: ["drain"],
  abilities: [
    whenYouPlay(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      },
      named(SWEETNESS),
    ),
    fanfare({
      targets: [anotherFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 3, -3);
        if (noSuperEvolutionPoint(fx.game, fx.controller)) yield* fx.tokensToEx([SWEETNESS]);
      },
    }),
  ],
});
