import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// Per-card settings replace the whole zone, so they list everything the card needs.
describe("BP18 whole set", () => {
  setSmokeTests("BP18", {
    games: 40,
    extras: {
      perCard: {
        // Verdant Law Supplicant (Evolved): its base evolves only after an evolution this turn.
        "BP18-015": { evolvedThisTurn: 1 },
        // Airbound Barrage: a Forestcraft card of yours.
        "BP18-019": { field: ["BP01-T10", "BP18-011", "BP01-042"] },
        // Enchanted Sword: a Mage follower of yours.
        "BP18-056": { field: ["BP01-T10", "BP18-049", "BP01-042"] },
        // Crescent Moon of Centennial Death: a 2-cost Togh Keyoh follower in the cemetery.
        "BP18-085": { cemetery: ["BP18-005"] },
        // Warped Progress: a Togh Keyoh card in the hand for its additional cost.
        "BP18-119": { hand: ["BP18-119", "BP18-005"] },
        // Youthful Strike: a Togh Keyoh follower of yours.
        "BP18-T05": { field: ["BP01-T10", "BP18-005", "BP01-042"] },
      },
    },
  });
});
