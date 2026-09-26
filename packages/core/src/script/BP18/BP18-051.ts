// BP18-051 Bejeweled Bouncer — Runecraft follower, 2, 2/3. 透京・錬金術師・商人.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Banish the top card of your deck.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { banishTop } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* banishTop(fx, 1);
      },
    }),
  ],
});
