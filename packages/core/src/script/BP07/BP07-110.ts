// BP07-110 Robogoblin — Neutral follower, 2, 2/2. 機械・ゴブリン.
// {[evolve]} {[cost01]}: Evolve this follower.
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
