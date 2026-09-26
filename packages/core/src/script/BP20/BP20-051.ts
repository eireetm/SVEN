// BP20-051 Devotee of Destruction (Evolved) — 2/2.
// Assail.
// On Evolve - Bury another Idolatry card on your field: Draw a card. (CR 10.4.7.4.)
import { defineCard, onEvolve } from "../helpers";
import { buryAnotherIdolatry } from "./shared-rune";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    onEvolve({
      cost: buryAnotherIdolatry,
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
