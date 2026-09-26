// BP19-009 Budding Initiate — Forestcraft follower, 1, 1/1. 八獄・エルフ族.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]}, Combo (3) - Evolve this. (Not this turn's evolve ability — ruling, CR 8.3.2.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        if (fx.game.combo(fx.controller, 3) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
