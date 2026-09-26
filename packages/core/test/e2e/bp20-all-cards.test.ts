import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// Per-card settings replace the whole zone, so they list everything the card needs.
describe("BP20 whole set", () => {
  setSmokeTests("BP20", {
    games: 40,
    extras: {
      perCard: {},
    },
  });
});
