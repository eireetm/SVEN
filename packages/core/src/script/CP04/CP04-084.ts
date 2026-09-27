// CP04-084 Miyako — Abysscraft follower, 1, 2/2. プリコネ・ディアボロス.
// {[ub]} Activate {[cost04]}: Select an enemy follower on the field. Banish it and give your leader {[defense]}+2. (Without an enemy
// follower it can't be activated — ruling.)
// {[fanfare]} Look at the top 5 cards of your deck. You may reveal a Diabolos follower from among them and add it to your hand. Put
// the rest on the bottom of your deck in any order. If you revealed a Diabolos follower, discard a card.
import { activated, defineCard, fanfare, lookAtTopCards, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { diabolos, followerThat } from "./shared";

export default defineCard({
  abilities: [
    ub(
      activated(
        { playPoints: 4 },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.banish(fx.targets[0]!);
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        const taken = yield* lookAtTopCards(fx, 5, { filter: followerThat(diabolos), to: "hand" });
        if (taken.length > 0) yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
