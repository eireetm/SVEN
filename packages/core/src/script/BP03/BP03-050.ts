// BP03-050 Witch of Sweets (Evolved) — Runecraft, 2/2.
// On Evolve: Draw a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [onEvolve({ *resolve(fx) { yield* fx.draw(1); } })],
});
