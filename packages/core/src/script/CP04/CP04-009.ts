// CP04-009 Rino — Forestcraft follower, 1, 1/1. プリコネ・ラビリンス.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]} If this was played from the EX area, evolve it. (Not by its evolve ability: it doesn't count as the turn's evolve —
// ruling, CR 8.3.2.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      condition: (g, _c, self) => g.enteredFrom(self) === "ex" && !g.enteredByAbility(self),
      *resolve(fx) {
        yield* fx.evolve(fx.self);
      },
    }),
  ],
});
