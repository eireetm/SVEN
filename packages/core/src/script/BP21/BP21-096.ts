// BP21-096 Lou, Lady-in-Training — Havencraft follower, 1, 1/1. 信仰・学院・光輝.
// {[evolve]} {[cost01]}: Evolve this. Activate only if this gained defense this turn.
// {[fanfare]} If there's another Academic follower on your field, give your leader {[defense]}+1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { anotherAcademicFollower } from "./shared-haven";

export default defineCard({
  abilities: [
    evolveAbility(1, { condition: (g, _c, self) => g.gainedDefenseThisTurn(self) }),
    fanfare({
      *resolve(fx) {
        if (anotherAcademicFollower(fx.game, fx.controller, fx.self)) yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
