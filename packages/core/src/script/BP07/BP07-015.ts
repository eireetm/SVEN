// BP07-015 Forest Hermit (Evolved) — 2/2.
// On Evolve - Select a Natura card in your cemetery and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { inYourZone } from "../targets";
import { natura } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: natura })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
