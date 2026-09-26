// BP16-013 Fairy Tamer — Forestcraft follower, 2, 1/1. 妖精・エルフ族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Summon a Fairy token.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { FAIRY } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([FAIRY]);
      },
    }),
  ],
});
