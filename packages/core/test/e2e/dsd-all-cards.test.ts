import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// DSD01a / DSD01b (most cards have only Japanese data): their new cards together.
describe("DSD01a–b new cards", () => {
  setSmokeTests(["DSD01a", "DSD01b"], {
    games: 40,
    // Two Academic cards in the hand for DSD01a-014's additional cost (reveal 2 Academic cards).
    extras: { hand: ["BP21-045", "BP21-045"] },
  });
});
