// BP20-010 Supplicant of Unkilling (Evolved) — 2/2.
// On Evolve - If there's an enemy follower on the field with 1 defense, give your leader {[defense]}+2.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollowerWithOneDefense } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        if (enemyFollowerWithOneDefense(fx.game, fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
