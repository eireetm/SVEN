// BP18-031 Unorthodox Assistance — Swordcraft spell, 1. 透京・探偵.
// Search your deck for a Shinra, All-Discerning, reveal it, add it to your hand, then shuffle. Place 2 gigabyte counters on
// each Gigabyte Blade on your field. (The card is named "Shinra, All Discerning", BP18-020; the counters are placed even if
// it isn't found — ruling.)
import { defineCard, spell } from "../helpers";
import { named } from "../targets";
import { chargeBlades } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.search((id) => named("Shinra, All Discerning")(fx.game, id));
        yield* chargeBlades(fx, 2);
      },
    }),
  ],
});
