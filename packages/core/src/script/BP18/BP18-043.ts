// BP18-043 Bejeweled Supermodel — Runecraft follower, 4, 3/3. 透京・錬金術師・商人.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Draw 3 cards. Banish 2 cards from your hand.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { banishFromHand } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(3);
        yield* banishFromHand(fx, 2);
      },
    }),
  ],
});
