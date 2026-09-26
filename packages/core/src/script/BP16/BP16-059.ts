// BP16-059 Nirle, Draconic Prodigy — Dragoncraft follower, 2, 1/1. 荒野・竜族.
// {[evolve]} {[cost01]}: Evolve this. Activate only if Overflow is active for you.
// {[fanfare]} If there's a Mount card on your field, increase your max play points by 1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { countIn, mount } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1, { condition: (g, p) => g.overflow(p) }),
    fanfare({
      condition: (g, p) => countIn(g, p, "field", mount) > 0,
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
  ],
});
