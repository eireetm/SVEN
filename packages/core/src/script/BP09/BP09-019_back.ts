// BP09-019_back Celia, Despair's Messenger — Swordcraft follower, 4/4. 指揮官・キラー. The back face of
// BP09-019 (CR 2.14; its Japanese text and traits are transcribed from the card, data/fixes.ts).
// Storm.
// On Evolve - Summon a Steelclad Knight and Knight token. (With room for one, its player picks
// which — ruling, CR 4.4.4.2.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Steelclad Knight", "Knight"]);
      },
    }),
  ],
});
