// BP17-100 Aerial Craft — Havencraft follower, 3, 3/3. 機械・超克.
// {[evolve]} {[cost01]}: Evolve this.
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
