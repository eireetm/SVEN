// BP04-107 Star Priestess (Evolved) — Havencraft, 4/4.
// On Evolve: Select an amulet in your cemetery and put it onto your field.
import { defineCard, onEvolve } from "../helpers";
import { inYourZone, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: isAmulet })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
