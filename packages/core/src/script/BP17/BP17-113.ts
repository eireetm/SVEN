// BP17-113 Hoverboard Mercenary — Neutral follower, 2, 1/1. 機械・傭兵.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Summon an Assembly Droid token. Put a Repair Mode token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { DROID, REPAIR } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([DROID]);
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
