import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("BP07 whole set", () => {
  setSmokeTests("BP07", {
    games: 40,
    extras: {
      // Machina and Natura cards for cemetery conditions and costs (BP07-069, 075, 085, 103, 106).
      cemetery: ["BP07-081", "BP07-081", "BP07-081", "BP07-044", "BP07-044", "BP07-013", "BP07-075"],
      // A Ladica for BP07-007.
      field: ["BP07-001"],
      perCard: {
        // "Activate only if you've played at least 5 cards this turn."
        "BP07-002": { playedThisTurn: 5 },
        // "Activate only if there are 5 Machina followers on your field."
        "BP07-070": { field: ["BP07-069", "BP07-T01", "BP07-T01", "BP07-T01", "BP07-T01"] },
      },
      notInScenario: {
        "BP07-105": "no evolve ability: evolved only by BP07-104's Last Words (its ruling)",
      },
    },
  });
});
