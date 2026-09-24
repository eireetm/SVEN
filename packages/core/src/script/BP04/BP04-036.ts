// BP04-036 Tristan of the Round Table (Evolved) — Swordcraft, 3/3.
// Ward.
// On Evolve: Select an Arthurian card in your cemetery and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { hasTrait, inYourZone } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: hasTrait("円卓") })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
