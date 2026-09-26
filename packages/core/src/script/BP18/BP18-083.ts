// BP18-083 Covetous Serpent (Evolved) — 4/4.
// Storm.
// On Evolve - Refresh this.
// Activate {[engage]} this, reveal two 2-cost cards from your hand: Select an enemy follower on the field and deal it 4
// damage.
import { defineCard, onEvolve } from "../helpers";
import { serpentBite } from "./shared-abyss";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
      },
    }),
    serpentBite,
  ],
});
