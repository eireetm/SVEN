// BP11-109 Wandering Chef — Neutral follower, 2, 2/2. 荒野・コック.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there is a Mount card on your field or in your EX area, give your leader {[defense]}+2.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { mountsOnFieldAndEx } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => mountsOnFieldAndEx(g, p) >= 1,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
