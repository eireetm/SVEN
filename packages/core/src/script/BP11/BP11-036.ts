// BP11-036 Vincent, the Peacekeeper (Evolved) — Runecraft follower, 5/5. 荒野・魔法使い.
// On Evolve - If there are at least 3 cards with different base costs in your cemetery, give your
// leader {[defense]}+3. If there are at least 6, draw a card. If there are at least 9, deal 9 damage to
// each enemy follower on the field. If there are at least 12, deal 12 damage to each enemy leader.
// (Losing by drawing from an empty deck and the opponent's leader at 0 are checked together
// afterwards: a draw — ruling, CR 1.2.2.)
import { defineCard, onEvolve } from "../helpers";
import { distinctCostsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const n = distinctCostsInCemetery(fx.game, fx.controller);
        const opponent = fx.game.opponent(fx.controller);
        if (n >= 3) yield* fx.giveLeaderDefense(fx.controller, 3);
        if (n >= 6) yield* fx.draw(1);
        if (n >= 9) yield* fx.dealDamageEach(fx.game.followers(opponent), 9);
        if (n >= 12) yield* fx.dealDamage(fx.game.leader(opponent), 12);
      },
    }),
  ],
});
