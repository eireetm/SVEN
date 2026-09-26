// BP19-093 Uneriel, Winged Enforcer — Havencraft follower, 6, 5/5. 八獄・鳥族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Draw 2 cards.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
