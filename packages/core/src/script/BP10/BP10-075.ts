// BP10-075 VI. Milteo, The Lovers (Evolved) — Abysscraft follower, 6/6. アルカナ・魔界.
// On Evolve - {[cost02]}: Destroy each enemy follower on the field. Change each enemy leader's defense
// to 6. (Also up to 6 from 5 or less — ruling, CR 5.27.2.)
import { playPointsCost } from "../costs";
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      cost: playPointsCost(2),
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.destroy(fx.game.followers(opponent));
        yield* fx.setLeaderDefense(opponent, 6);
      },
    }),
  ],
});
