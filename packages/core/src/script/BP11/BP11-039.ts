// BP11-039 Magical Gunslinger (Evolved) — Runecraft follower, 4/4. 荒野・魔法使い.
// On Evolve - If there are at least 6 cards with different base costs in your cemetery, summon an
// Arcane Personnel Carrier token.
// During your turn, whenever a Mount card is put onto your field, select an enemy follower on the field.
// Deal it 2 damage, draw a card, then discard a card.
import { defineCard, onEvolve } from "../helpers";
import { CARRIER, distinctCostsInCemetery } from "./shared";
import { gunslingerShot } from "./shared-rune";

export default defineCard({
  abilities: [
    onEvolve({
      condition: (g, p) => distinctCostsInCemetery(g, p) >= 6,
      *resolve(fx) {
        yield* fx.summon([CARRIER]);
      },
    }),
    gunslingerShot(),
  ],
});
