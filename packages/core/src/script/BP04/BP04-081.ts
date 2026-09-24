// BP04-081 Howling Demon (Evolved) — Abysscraft, 7/6.
// Storm.
// On Evolve: If Sanguine is active for you, give your leader +5 defense.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        if (fx.game.sanguine(fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
  ],
});
