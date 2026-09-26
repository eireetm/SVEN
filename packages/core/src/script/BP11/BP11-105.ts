// BP11-105 Quixotic Adventurer — Neutral follower, 1, 2/1. 荒野・傭兵.
// {[evolve]} {[cost04]}: Evolve this follower.
// {[fanfare]} Put a Dutiful Steed token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { STEED } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(4),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([STEED]);
      },
    }),
  ],
});
