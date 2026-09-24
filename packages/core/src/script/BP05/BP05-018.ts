// BP05-018 Octrice, Omen of Usurpation — Swordcraft follower, 2, 2/2. 絶傑・盗賊.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[evolve]} {[cost00]}: Evolve this follower. This ability can be activated if there are at least
// 10 cards in opponents' cemeteries.
// {[fanfare]} Each opponent puts the top 2 cards of their deck into their cemetery.
// {[act]} {[cost08]}: Select a card in an opponent's cemetery and play it for 0 play points.
// (An empty deck only means nothing is put there — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { opponentCemeteryTen, playFromOpponentCemetery } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    evolveAbility(0, { condition: (g, c) => opponentCemeteryTen(g, c) }),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2, fx.game.opponent(fx.controller));
      },
    }),
    playFromOpponentCemetery,
  ],
});
