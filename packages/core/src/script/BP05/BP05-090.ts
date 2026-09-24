// BP05-090 Apostle of Repose (Evolved) — Havencraft follower, 3/5. 絶傑・狂信.
// On Evolve: Select a reserved enemy follower on the field and banish it.
// At the start of each opponent's main phase, recover 2 play points.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { recoverOnOpponentsMainPhase } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: (g, id) => g.card(id)?.engaged === false })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0] ?? []);
      },
    }),
    recoverOnOpponentsMainPhase(2),
  ],
});
