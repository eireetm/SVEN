// SD01-009 Treant — Forestcraft follower, 3, 3/3. 精霊.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]}, Combo (3): Change this card's Evolve cost to 0. (Not "this turn": it lasts while it is on the field. The cost is
// then 0, not 2 — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        if (fx.game.combo(fx.controller, 3)) yield* fx.setEvolveCost(fx.self, 0, null);
      },
    }),
  ],
});
