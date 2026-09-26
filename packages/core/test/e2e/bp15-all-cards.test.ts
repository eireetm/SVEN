import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// Per-card settings replace the whole zone, so they list everything the card needs.
describe("BP15 whole set", () => {
  setSmokeTests("BP15", {
    games: 40,
    extras: {
      perCard: {
        // Rejuvenating Resurrection: an Amataz follower in the cemetery.
        "BP15-009": { cemetery: ["BP15-002"] },
        // Melody's Return: banish a Lishenna follower from the cemetery as its additional cost.
        "BP15-045": { cemetery: ["BP15-039"] },
        // Secrets of Onmyodo: reveal 2 other Onmyoji cards from the hand as its additional cost.
        "BP15-046": { hand: ["BP15-046", "BP06-046", "BP06-048"] },
        // Spiteful Screams: an Abysscraft follower with Last Words (2 or less) in the cemetery.
        "BP15-082": { cemetery: ["BP15-088"] },
        // A Hellish Banquet: bury 2 One-Tailed Foxes as its additional cost.
        "BP15-083": { field: ["BP06-T03", "BP06-T03", "BP01-042"] },
        // Ersatz Elimination: an Omen Mage follower (3 or less) in the cemetery.
        "BP15-PR11": { cemetery: ["BP15-047"] },
        // Gilded Boots: a Thief follower on the field.
        "BP15-T03": { field: ["BP15-024", "BP01-042"] },
      },
    },
  });
});
