// CP01-067 Mejiro McQueen (Evolved) — 5/5.
// Ward.
// On Evolve: Select an amulet in your cemetery and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { inYourZone, isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: isAmulet })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
