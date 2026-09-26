import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// The busy scenario's field already holds 3 cards (4 with an evolved card's base), so per-card fields
// list everything they need.
describe("BP14 whole set", () => {
  setSmokeTests("BP14", {
    games: 40,
    extras: {
      perCard: {
        // Riley evolves after Earth Rite removed 2 Stack counters this turn.
        "BP14-038": { stackRemovedByEarthRite: 2 },
        // Paracelise evolves with an empty hand.
        "BP14-073": { hand: [] },
        // An Abysscraft follower on the field.
        "BP14-087": { field: ["BP14-074", "BP01-T10", "BP01-042"] },
        // Magna Saber evolves with 3 Festive cards on the field and/or in the EX area.
        "BP14-106": { field: ["BP14-105", "BP14-008", "BP14-012", "BP01-042"] },
      },
    },
  });
});
