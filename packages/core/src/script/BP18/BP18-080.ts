// BP18-080 Vania, Crimson Majesty — Abysscraft follower, 2, 2/2. 吸血鬼・プリンセス.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard a Vampire card: Put a Forest Bat token into your EX area. Draw a card. (CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { FOREST_BAT, vampire } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: discardA(vampire),
      *resolve(fx) {
        yield* fx.tokensToEx([FOREST_BAT]);
        yield* fx.draw(1);
      },
    }),
  ],
});
