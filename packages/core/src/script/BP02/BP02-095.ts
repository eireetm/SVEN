// BP02-095 Elana's Prayer — Havencraft amulet, 3.
// Once per turn, when your leader gains {[defense]}, give each follower on your field
// {[attack]}+1/{[defense]}+1. (Also on the opponent's turn; each copy once per turn — rulings;
// CR 10.7.2.2, 5.27.)
import { defineCard, whenYourLeaderGainsDefense } from "../helpers";

export default defineCard({
  abilities: [
    whenYourLeaderGainsDefense({
      oncePerTurn: true,
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
