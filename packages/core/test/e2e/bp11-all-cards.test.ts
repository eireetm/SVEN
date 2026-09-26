import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// The busy scenario's field already holds 3 cards (4 with an evolved card's base), so per-card fields
// list everything they need.
const FAIRY = "BP01-T03";

describe("BP11 whole set", () => {
  setSmokeTests("BP11", {
    games: 40,
    extras: {
      // Puppetry (BP11-017) and Wasteland followers that cost 3 or less (BP11-071, 078, 079) in the cemetery.
      cemetery: ["BP11-010", "BP11-071", "BP11-076", "BP11-014"],
      perCard: {
        // Four Pixie tokens to bury.
        "BP11-007": { field: [FAIRY, FAIRY, FAIRY, FAIRY] },
      },
      notInScenario: {
        "BP11-034": "can't be played during your turn (a Quick spell for the opponent's turn)",
        "BP11-036": "evolves only after Vincent gained attack or defense this turn",
        "BP11-077": "evolves only when Wretch came from the cemetery",
        "BP11-104": "evolved only by BP11-103's Fanfare (no evolve ability)",
      },
    },
  });
});
