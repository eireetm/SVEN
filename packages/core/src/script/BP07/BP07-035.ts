// BP07-035 Tetra, Sapphire Rebel — Runecraft follower, 3, 3/3. 機械・ゴーレム.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Put a Repair Mode token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { REPAIR } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
