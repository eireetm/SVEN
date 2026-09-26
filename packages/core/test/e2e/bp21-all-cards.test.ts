import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// Per-card settings replace the whole zone, so they list everything the card needs.
const BUSY_FIELD = ["BP01-T10", "BP01-042", { card: "BP01-173", engaged: true }];

describe("BP21 whole set", () => {
  setSmokeTests("BP21", {
    games: 40,
    extras: {
      perCard: {
        // Bladebunny (Evolved): its base evolves only after a card of yours returned to hand this turn.
        "BP21-014": { returnedToHand: 1 },
        // Agile Twinblader (Evolved): its base evolves only if it was put onto the field by an ability.
        "BP21-024": { field: [{ card: "BP21-023", enteredByAbility: true }, ...BUSY_FIELD] },
        // Lou, Lady-in-Training (Evolved): its base evolves only if it gained defense this turn.
        "BP21-097": { field: [{ card: "BP21-096", gainedDefenseThisTurn: true }, ...BUSY_FIELD] },
      },
    },
  });
});
