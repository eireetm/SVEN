// BP18-032 Blind Spot Surveyor — Swordcraft follower, 1, 1/1. 透京・探偵.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there are at least 3 Togh Keyoh cards on your field, give your leader {[defense]}+2. (It counts.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { toghKeyohOnField } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (toghKeyohOnField(fx.game, fx.controller) >= 3) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
