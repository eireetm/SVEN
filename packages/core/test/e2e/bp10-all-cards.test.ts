import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// The busy scenario's field already holds 3 cards (4 with an evolved card's base), so per-card fields
// list everything they need. Advanced cards (CR 9.2) are played from the EX area.
const DRACONIC_WEAPON = "BP02-T07";

describe("BP10 whole set", () => {
  setSmokeTests("BP10", {
    games: 40,
    extras: {
      // Heroic (BP10-026), Armed (BP10-059, 064, 070), Chess (BP10-042, 046, 052) cards.
      cemetery: [
        "BP10-027", "BP10-027", "BP10-027", "BP10-033", "BP10-033",
        "BP10-064", "BP10-064", "BP10-070",
        "BP10-046", "BP10-046", "BP10-052", "BP10-052", "BP10-042",
      ],
      hand: ["BP10-027", "BP10-121"],
      perCard: {
        // Five cards with different base costs in the EX area and Spinaria in the evolve deck.
        "BP10-003": { ex: ["BP01-T02", "BP05-T04", "BP01-T01", "BP05-T05", "BP01-T11"], evolveDeck: ["BP10-004"] },
        "BP10-019": { evolveDeck: ["BP10-020"] },
        "BP10-042": { field: ["BP03-039", "BP01-042"] },
        "BP10-058": { field: [DRACONIC_WEAPON, "BP01-042"] },
        "BP10-059": { field: [DRACONIC_WEAPON, "BP01-042"] },
        "BP10-063": { field: ["BP03-056", DRACONIC_WEAPON, DRACONIC_WEAPON], evolveDeck: ["BP10-057", "BP10-058"] },
        "BP10-081": { ex: ["BP03-074"], evolveDeck: ["BP10-077"] },
        "BP10-084": { field: ["BP10-076", "BP01-042"] },
        // Cards in the hand for its grace counters.
        "BP10-085": { hand: ["BP10-085", "BP01-042", "BP01-042", "BP01-042"] },
        "BP10-094": { field: ["BP01-042"] },
        "BP10-102": { field: ["BP10-094", "BP01-042"] },
        // An Angel follower in the cemetery.
        "BP10-114": { cemetery: ["BP10-119"] },
      },
      notInScenario: {
        "BP10-055": "evolved only by BP10-054's Fanfare (no evolve ability)",
        "BP10-075": "evolved only by BP10-074's end phase ability (no evolve ability)",
      },
    },
  });
});
