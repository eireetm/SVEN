// BP01-127 Jeanne d'Arc — Havencraft follower, 4, 3/4.
// {[evolve]}{[cost02]}: Evolve this follower.
// {[fanfare]} Deal 2 damage to each enemy follower on the field.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
