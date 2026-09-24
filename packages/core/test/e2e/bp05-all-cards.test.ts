import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("BP05 whole set", () => {
  setSmokeTests("BP05", {
    games: 40,
    extras: {
      // A Commander card (BP05-026), a Mage card (BP05-035) and an amulet (BP05-091) to discard.
      hand: ["BP05-023", "BP05-046", "BP05-101"],
      // Hunter cards for Izudia and Mark of the Unkilling (BP05-001, 011, 012).
      cemetery: ["BP05-004", "BP05-004", "BP05-004"],
    },
  });
});
