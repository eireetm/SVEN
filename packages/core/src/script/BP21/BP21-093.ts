// BP21-093 Elluvia, Graceful Lady — Havencraft follower, 3, 3/3. 信仰・学院・光輝.
// Twice per turn, when your leader gains {[defense]}, give each other follower on your field {[attack]}+1/{[defense]}+1.
// (CR 10.7.2.2; on the opponent's turn too — ruling.)
// {[fanfare]} You may summon an Academic follower not named Elluvia, Graceful Lady that costs X or less from your hand. X
// equals your remaining play points. (元のコスト; X as it resolves.)
import { defineCard, fanfare, whenYourLeaderGainsDefense } from "../helpers";
import { named } from "../targets";
import { academicFollower } from "./shared";

const elluvia = named("Elluvia, Graceful Lady");

export default defineCard({
  abilities: [
    {
      ...whenYourLeaderGainsDefense({
        *resolve(fx) {
          for (const id of fx.game.followers(fx.controller).filter((f) => f !== fx.self)) yield* fx.giveStats(id, 1, 1);
        },
      }),
      timesPerTurn: 2,
    },
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const x = g.state.players[fx.controller].playPoints;
        const hand = g.cards(fx.controller, "hand").filter((id) => academicFollower(g, id) && !elluvia(g, id) && (g.info(id).cost ?? Infinity) <= x);
        const chosen = yield* fx.selectCards(hand, 0, 1);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
      },
    }),
  ],
});
