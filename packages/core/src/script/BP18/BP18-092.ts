// BP18-092 Beryl, Dreameater — Abysscraft follower, 3, 3/3. 魔界・吸血鬼.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Forest Bat token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { FOREST_BAT } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FOREST_BAT]);
      },
    }),
  ],
});
