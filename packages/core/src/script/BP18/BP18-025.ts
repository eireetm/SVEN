// BP18-025 Bird's-Eye Investigator (Evolved) — 4/4.
// Ward.
// On Evolve - Search your deck for up to 2 Togh Keyoh followers that cost a total of 3 or less, summon them, then shuffle.
// (元のコスト; with room for one, the player picks which — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";
import { toghKeyoh } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && toghKeyoh(fx.game, id), { max: 2, totalCostAtMost: 3, to: "field" });
      },
    }),
  ],
});
