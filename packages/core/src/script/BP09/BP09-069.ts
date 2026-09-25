// BP09-069 Vania, Nightshade Vampire — Abysscraft follower, 3, 3/3. 吸血鬼・プリンセス.
// {[evolve]} {[cost01]}: Evolve this follower into a Vania, Kind Queen.
// {[evolve]} {[cost03]}: Evolve this follower into a Vania, Blood Queen. Activate only if there are at
// least 5 Vampire cards in your cemetery. (The two faces of the double-faced BP09-070, CR 4.6.4.)
// {[fanfare]} Put a Forest Bat token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { countIn, FOREST_BAT, vampire } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1, { into: ["Vania, Kind Queen"] }),
    evolveAbility(3, { into: ["Vania, Blood Queen"], condition: (g, c) => countIn(g, c, "cemetery", vampire) >= 5 }),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FOREST_BAT]);
      },
    }),
  ],
});
