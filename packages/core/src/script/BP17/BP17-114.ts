// BP17-114 Hoverboard Mercenary (Evolved) — 2/2.
// On Evolve - Summon an Assembly Droid token. Put a Repair Mode token into your EX area.
import { defineCard, onEvolve } from "../helpers";
import { DROID, REPAIR } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([DROID]);
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
