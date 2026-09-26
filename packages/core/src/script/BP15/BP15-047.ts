// BP15-047 Adherent of Elimination — Runecraft follower, 2, 2/2. 絶傑・魔法使い.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If this wasn't put onto the field from hand, evolve it. (EX area, deck, cemetery ... — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, _p, self) => g.enteredFrom(self) !== "hand",
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
