// BP19-023 Gildaria, Anathema of Peace (Evolved) — 5/5.
// On Evolve - Deal 4 damage to each enemy follower on the field. Deal 2 damage to each enemy leader.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach(fx.game.followers(opp), 4);
        yield* fx.dealDamage(fx.game.leader(opp), 2);
      },
    }),
  ],
});
