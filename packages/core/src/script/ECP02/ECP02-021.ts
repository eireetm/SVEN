// ECP02-021 Chieri Ogata [Happiness Tune] — Swordcraft follower, 2, 2/2. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If this wasn't put onto the field from hand, evolve it. (From the EX area, deck or cemetery; on the opponent's turn
// too; not this turn's evolution — rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, _c, self) => g.enteredFrom(self) !== "hand",
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
