import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

const ITEM = "CP02-T01"; // Magical Item (CR 14.3.1): what Lesson (X) banishes from the EX area

// The collaboration starter decks, one universe at a time (CR 6.1.1.5): their other cards are reprints.
describe("CSD01 new cards (Umamusume)", () => {
  setSmokeTests("CSD01", { games: 20 });
});

describe("CSD02a–c new cards (CINDERELLA GIRLS)", () => {
  setSmokeTests(["CSD02a", "CSD02b", "CSD02c"], {
    games: 40,
    // Magical Items for the Lesson costs, next to a token and the crest every busy scenario has (BP20-T11).
    extras: { side: { ex: ["BP01-T03", "BP20-T11", ITEM, ITEM, ITEM] } },
  });
});

describe("CSD03a–b new cards (Cardfight!! Vanguard)", () => {
  setSmokeTests(["CSD03a", "CSD03b"], { games: 40 });
});
