// ECP02-033 Hiromi Seki [Twinkle in My Eye] (Evolved) — 2/2.
// On Evolve - Select a Cute card in your cemetery and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { inYourZone } from "../targets";
import { cute } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: cute })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
