// BP09-046 Witch of Foresight — Runecraft follower, 2, 1/3. 魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Look at the top card of your deck. You may bury it.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { lookAtTopMayBury } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopMayBury(fx);
      },
    }),
  ],
});
