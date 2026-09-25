// BP07-111 Robogoblin (Evolved) — 3/3.
// On Evolve - Summon an Assembly Droid token.
// {[lastwords]} Put a Repair Mode token into your EX area.
import { defineCard, lastWords, onEvolve } from "../helpers";
import { DROID, REPAIR } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([DROID]);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
