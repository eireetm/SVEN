// BP10-101 Puresong Priest — Havencraft follower, 7, 5/5. 信仰.
// {[fanfare]} Select a follower on your field. Give it and your leader {[defense]}+4. (It can select
// itself — ruling.)
// {[q]}Activate {[cost01]}, discard this card: Give your leader {[defense]}+2. (Valid in the hand —
// ruling, CR 10.3.5.)
import { discardThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 0, 4);
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
    activated(
      { playPoints: 1, custom: discardThis },
      {
        quick: true,
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
    ),
  ],
});
