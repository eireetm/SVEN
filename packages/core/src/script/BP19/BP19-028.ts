// BP19-028 Storm-Wracked First Mate — Swordcraft follower, 2, 2/2. 八獄・盗賊.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Dread Pirate's Flag token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { PIRATE_FLAG } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([PIRATE_FLAG]);
      },
    }),
  ],
});
