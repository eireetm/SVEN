// BP20-111 Mjerrabaine, Great Manifest — Neutral follower, 3, 3/3. 絶傑.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard your hand.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.discardHand();
      },
    }),
  ],
});
