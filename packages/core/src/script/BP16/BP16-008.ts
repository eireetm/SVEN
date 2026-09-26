// BP16-008 Liam, Crazed Creator — Forestcraft follower, 4, 3/3. 人形・キラー.
// {[fanfare]} Summon 2 Puppet tokens.
// Activate {[engage]} this: Look at the top 5 cards of your deck. You may put a Puppetry card that costs 3 or less
// from among them into your EX area. It costs 3 less to play this turn. Put the rest on the bottom of your deck in
// any order. (元のコスト.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost } from "../targets";
import { PUPPET, puppetry } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([PUPPET, PUPPET]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          for (const id of yield* lookAtTopCards(fx, 5, { filter: and(puppetry, costAtMost(3)), to: "ex" })) {
            yield* fx.changePlayCost(id, -3, "endOfTurn");
          }
        },
      },
    ),
  ],
});
