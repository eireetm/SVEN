import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// Per-card settings replace the whole zone, so they list everything the card needs.
describe("BP17 whole set", () => {
  setSmokeTests("BP17", {
    games: 40,
    extras: {
      perCard: {
        // Heroic Resolve: a Beast follower of yours.
        "BP17-011": { field: ["BP01-T10", "BP17-002", "BP01-042"] },
        // Shadowed Memories: an Assassin follower of yours.
        "BP17-030": { field: ["BP01-T10", "BP17-022", "BP01-042"] },
        // Brothers United: a Bayleon follower of yours.
        "BP17-036": { field: ["BP01-T10", "BP17-020", "BP01-042"] },
        // Nefarious Invasion: 3 Machina cards in the EX area.
        "BP17-044": { ex: ["BP07-T01", "BP07-T01", "BP07-T01"] },
        // Mysterian Wisdom: an Academic card in the hand to reveal.
        "BP17-054": { hand: ["BP17-054", "BP16-048"] },
        // Guild Assembly: a facedown evolved follower in the evolve deck for its additional cost.
        "BP17-116": { evolveDeck: ["BP17-003"] },
        // Curse of the Black Dragon: a Rowen, Dragon Lance of yours.
        "BP17-T06": { field: ["BP01-T10", "BP17-055", "BP01-042"] },
      },
    },
  });
});
