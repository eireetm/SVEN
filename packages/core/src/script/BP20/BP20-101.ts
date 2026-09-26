// BP20-101 Supplicant of Repose — Havencraft follower, 2, 2/2. 絶傑・狂信.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there are at least 3 crests in your EX area, give your leader {[defense]}+2.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { threeCrests } from "./shared-haven";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (threeCrests(fx.game, fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
