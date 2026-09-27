// CP03-109 Silent Tom (Evolved) — 4/4.
// Single Drive.
// On Evolve - Discard an Oracle Think Tank card: Select an enemy follower with 5 defense or less on the field and banish it.
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { oracleThinkTank } from "./shared";

export default defineCard({
  keywords: ["singleDrive"],
  abilities: [
    onEvolve({
      cost: discardA(oracleThinkTank),
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 5 })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
