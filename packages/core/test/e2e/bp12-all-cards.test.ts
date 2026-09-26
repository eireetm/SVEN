import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// The busy scenario's field already holds 3 cards (4 with an evolved card's base), so per-card fields
// list everything they need.
const TREE = "BP07-T03";
const FAIRY = "BP01-T03";

describe("BP12 whole set", () => {
  setSmokeTests("BP12", {
    games: 40,
    extras: {
      // Machina (BP12-072) and Dragoncraft (BP12-059) followers that cost 2 or less to summon from the
      // cemetery (BP12-060, 075, 089, 096).
      cemetery: ["BP12-072", "BP12-059"],
      perCard: {
        // 5 Natura cards in the cemetery: 5 less.
        "BP12-001": { cemetery: ["BP12-014", "BP12-014", "BP12-014", "BP12-014", "BP12-014"] },
        // A Pixie token on the field.
        "BP12-011": { field: [FAIRY, "BP01-T10", "BP01-042"] },
        // Two Naterran Great Trees to engage.
        "BP12-024": { field: [TREE, TREE, "BP01-042"] },
        // A Lecia and a Nano to engage.
        "BP12-T02": { field: ["BP12-020", "BP12-025"] },
        // Three Goblinoid followers.
        "BP12-111": { field: ["BP11-107", "BP11-107", "BP11-107"] },
      },
    },
  });
});
