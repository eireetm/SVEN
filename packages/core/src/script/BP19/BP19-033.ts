// BP19-033 Felpurr Maid (Evolved) — 3/3.
// Storm.
// Strike - Draw a card.
// On Evolve - Deal 1 damage to each enemy follower on the field.
import { defineCard, onEvolve, strike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
      },
    }),
  ],
});
