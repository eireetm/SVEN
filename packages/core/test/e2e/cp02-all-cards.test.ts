import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

const ITEM = "CP02-T01"; // Magical Item (CR 14.3.1): what Lesson (X) banishes from the EX area

describe("CP02 whole set", () => {
  setSmokeTests("CP02", {
    games: 40,
    extras: {
      // Magical Items for the Lesson costs, next to a token and the crest every busy scenario has (BP20-T11).
      side: { ex: ["BP01-T03", "BP20-T11", ITEM, ITEM, ITEM] },
      perCard: {
        // New Wave: Fanfare, Lesson (5).
        "CP02-104": { ex: [ITEM, ITEM, ITEM, ITEM, ITEM] },
      },
    },
  });
});
