// BP19-087 Vicious Blitzer (Evolved) — 2/2.
// On Evolve - Deal 1 damage to each leader.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(fx.controller), fx.game.leader(fx.game.opponent(fx.controller))], 1);
      },
    }),
  ],
});
