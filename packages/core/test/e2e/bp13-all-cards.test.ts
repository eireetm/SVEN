import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// The busy scenario's field already holds 3 cards (4 with an evolved card's base), so per-card fields
// list everything they need.
describe("BP13 whole set", () => {
  setSmokeTests("BP13", {
    games: 40,
    extras: {
      perCard: {
        // A Sekka on the field (BP13-001 has "Sekka" in its name).
        "BP13-008": { field: ["BP13-001", "BP01-T10", "BP01-042"] },
        // A Chess follower on the field (BP03-051 Magical Rook).
        "BP13-053": { field: ["BP03-051", "BP01-T10", "BP01-042"] },
        // A Dragoncraft follower that costs 7 or more on the field to engage.
        "BP13-064": { field: ["BP13-063", "BP01-T10", "BP01-042"] },
        // A Dragonewt follower on the field to bury.
        "BP13-070": { field: ["BP13-067", "BP01-T10", "BP01-042"] },
      },
    },
  });
});
