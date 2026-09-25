// BP09-021 Prim, Innocent Princess — Swordcraft follower, 2, 1/1. 指揮官・プリンセス.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon a Knight token.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Knight"]);
      },
    }),
  ],
});
