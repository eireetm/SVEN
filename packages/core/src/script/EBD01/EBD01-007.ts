// EBD01-007 Spinaria, Wavering Will — Forestcraft follower, 3, 1/3. 超克.
// Whenever a follower on your field evolves, give your leader {[defense]}+2. (The English says "follow"; the Japanese 自分の場の
// フォロワーが進化したとき. Also in the opponent's turn — ruling.)
// {[fanfare]} Select a {[forestcraft]} follower in your cemetery that originally costs 2 or less and put it into your EX area. This
// turn, it costs 2 less to play.
import { defineCard, fanfare, whenYourFollowerEvolves } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower } from "../targets";
import { intoExCheaper } from "../ECP02/shared";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Forestcraft"), costAtMost(2)) })],
      *resolve(fx) {
        yield* intoExCheaper(fx, fx.targets[0]!, 2);
      },
    }),
  ],
});
