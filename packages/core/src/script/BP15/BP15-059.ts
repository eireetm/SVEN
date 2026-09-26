// BP15-059 Filene, Blizzardous Heart (Evolved) — Dragoncraft follower, 2/3. ドラゴニュート.
// Bane.
// On Evolve - Search your deck for a card with "Whitefrost" in its name, reveal it, add it to your hand, then
// shuffle.
import { defineCard, onEvolve } from "../helpers";
import { nameIncludes } from "../targets";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => nameIncludes("Whitefrost")(fx.game, id));
      },
    }),
  ],
});
