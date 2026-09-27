import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("CP04 whole set", () => {
  setSmokeTests("CP04", {
    games: 40,
    extras: {
      // A PriConne follower (Kokkoro) for CP04-018 and CP04-054 to select on your field.
      field: ["CP04-001"],
      perCard: {
        // Lima can only be played on your 5th turn or later (CR 3.3.2).
        "CP04-013": { turnsPassed: 5 },
      },
    },
  });
});
