// BP05-029 Servant of Usurpation — Swordcraft follower, 1, 1/2. 絶傑・盗賊.
// {[fanfare]} Each opponent puts the top card of their deck into their cemetery.
// During your turn, whenever a card is put from an opponent's deck into the cemetery, give this
// follower {[attack]}+1. (Once per card — ruling.)
import { defineCard, fanfare, whenOpponentDeckCardToCemetery } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(1, fx.game.opponent(fx.controller));
      },
    }),
    whenOpponentDeckCardToCemetery(
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 1, 0);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
