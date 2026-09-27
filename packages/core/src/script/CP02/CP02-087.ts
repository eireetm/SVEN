// CP02-087 Shin Sato — Havencraft follower, 3, 3/3. デレマス・パッション.
// {[evolve]} {[cost06]}: Evolve this follower.
// {[fanfare]} Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(6),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
