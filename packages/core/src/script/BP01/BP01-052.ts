// BP01-052 Merlin — Runecraft follower, 3, 3/2.
// {[evolve]}{[cost02]}: Evolve this follower.
// {[fanfare]} Search your deck for a spell, reveal it, and add it to your hand.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isSpell(fx.game, id));
      },
    }),
  ],
});
