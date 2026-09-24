// BP05-021 Apostle of Usurpation — Swordcraft follower, 4, 3/4. 絶傑・盗賊.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Each opponent puts the top 2 cards of their deck into their cemetery. Then, if there
// are at least 10 cards in opponents' cemeteries, draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { opponentCemeteryTen } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2, fx.game.opponent(fx.controller));
        if (opponentCemeteryTen(fx.game, fx.controller)) yield* fx.draw(1);
      },
    }),
  ],
});
