// BP02-001 Crystalia Tia — Forestcraft follower, 2, 1/1.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]}, Combo (3): Summon a Crystalia Eve token. (CR 13.2.1.2: including this card.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.combo(fx.controller, 3)) yield* fx.summon(["Crystalia Eve"]);
      },
    }),
  ],
});
