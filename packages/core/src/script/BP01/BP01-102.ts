// BP01-102 Cerberus (Evolved) — 5/5.
// On Evolve - Put a Mimi, Infernal Right Paw and Coco, Infernal Left Paw token into your EX area.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Mimi", "Coco"]);
      },
    }),
  ],
});
