// BP11-056 Georgius (Evolved) — Dragoncraft follower, 5/5. 竜族・武闘竜人・キラー.
// On Evolve - Destroy each enemy follower with 3 defense or less on the field.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.destroy(fx.game.followers(opponent).filter((id) => (fx.game.info(id).defense ?? Infinity) <= 3));
      },
    }),
  ],
});
