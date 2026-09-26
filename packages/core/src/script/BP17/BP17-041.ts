// BP17-041 Tetra, Serene Sapphire — Runecraft follower, 2, 2/2. 機械・ゴーレム.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Repair Mode token in your EX area.
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
