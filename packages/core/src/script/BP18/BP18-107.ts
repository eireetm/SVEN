// BP18-107 Lorena, Iron-Willed Priest — Havencraft follower, 4, 3/3. 信仰.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Give your leader {[defense]}+4.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
