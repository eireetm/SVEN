// CP03-003 Storm Rider, Diamantes — Forestcraft follower, 3, 3/2. ヴァンガード・アクアフォース.
// Rush.
// {[fanfare]} Select an enemy follower on the field and engage it.
// {[lastwords]} If it's your turn, look at the top 5 cards of your deck. You may summon up to two 1-cost Aqua Force followers
// from among them. Put the rest on the bottom of your deck in any order. (Destroyed in your end phase, it is still your turn —
// ruling. 元のコスト.)
import { defineCard, fanfare, lastWords, lookAtTopCards } from "../helpers";
import { enemyFollower } from "../targets";
import { aquaForce, followerThat } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
      },
    }),
    lastWords({
      condition: (g, c) => g.activePlayer === c,
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: (g, id) => followerThat(aquaForce)(g, id) && g.info(id).cost === 1, to: "field", max: 2 });
      },
    }),
  ],
});
