// BP13-114 Goddess of Rebirth — Neutral follower, 10, 7/7. 光輝.
// Ward.
// {[fanfare]} Give your leader {[defense]}+7.
// {[q]}Activate {[cost04]}, discard this card: Select an enemy follower on the field and destroy it. (Valid in
// the hand — ruling, CR 10.3.5; {[q]}: also at Quick timing, CR 12.3.3.)
import { discardThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 7);
      },
    }),
    activated(
      { playPoints: 4, custom: discardThis },
      {
        validIn: ["hand"],
        quick: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});
