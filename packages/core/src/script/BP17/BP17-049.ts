// BP17-049 Awakened Robot — Runecraft follower, 2, 2/2. 機械・自然・ゴーレム.
// {[evolve]} {[cost01]}: Evolve this.
// {[lastwords]} Put a Repair Mode token into your EX area.
import { defineCard, evolveAbility, lastWords } from "../helpers";
import { REPAIR } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
