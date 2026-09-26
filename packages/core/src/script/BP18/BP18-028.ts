// BP18-028 Cold Case Analyst — Swordcraft follower, 2, 3/1. 透京・探偵.
// {[evolve]} {[cost01]}: Evolve this.
// Assail.
// {[fanfare]} If there are at least 3 Togh Keyoh cards on your field, evolve this. (It counts; not this turn's evolve
// ability — ruling, CR 8.3.2.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { toghKeyohOnField } from "./shared";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (toghKeyohOnField(fx.game, fx.controller) >= 3 && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
