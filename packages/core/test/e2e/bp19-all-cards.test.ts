import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// Per-card settings replace the whole zone, so they list everything the card needs.
describe("BP19 whole set", () => {
  setSmokeTests("BP19", {
    games: 40,
    extras: {
      perCard: {
        // Return from the Brink: an Officer follower in your cemetery.
        "BP19-031": { cemetery: ["BP19-035"] },
        // Dread Pirate's Flag: a Thief follower of yours.
        "BP19-T01": { field: ["BP01-T10", "BP19-030", "BP01-042"] },
      },
    },
  });
});
