// BP01-027 Sea Queen Otohime (Evolved) — 4/5.
// On Evolve: Summon 3 Otohime's Bodyguard tokens. If your field becomes full from this effect,
// put any remaining tokens into your EX area.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const b = "Otohime's Bodyguard";
        yield* fx.summon([b, b, b], { overflowToEx: true });
      },
    }),
  ],
});
