import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// Per-card settings replace the whole zone, so they list everything the card needs.
describe("BP16 whole set", () => {
  setSmokeTests("BP16", {
    games: 40,
    extras: {
      perCard: {
        // Bayle: only after a follower of yours left the field this turn.
        "BP16-011": { leftFieldThisTurn: ["BP01-042"] },
        // Ravening Tentacles: engage a Levin follower as its additional cost.
        "BP16-026": { field: ["BP02-027", "BP01-042"] },
        // Doomwright Resurgence: a Supreme token follower (5 or less) on the field.
        "BP16-121": { field: ["BP05-T04", "BP01-042"] },
      },
    },
  });
});
