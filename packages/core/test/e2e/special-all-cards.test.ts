import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// Special and deck products with a few new cards each (their other cards are reprints). ETD01–03, EBD03, EBD04, PCS02, SCS01,
// LCS01 and PR have none but leaders.
describe("EBD01, EBD02, SP01 new cards", () => {
  setSmokeTests(["EBD01", "EBD02", "SP01"], { games: 30 });
});

describe("PCS01 new cards (Princess Connect! Re: Dive)", () => {
  setSmokeTests("PCS01", { games: 20 });
});
