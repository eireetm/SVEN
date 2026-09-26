// BP16-001 Aria, Lady of the Woods — Forestcraft follower, 1, 1/1. 妖精・プリンセス.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put 2 Fairy tokens into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { FAIRY } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY, FAIRY]);
      },
    }),
  ],
});
