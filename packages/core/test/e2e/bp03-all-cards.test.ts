import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("BP03 whole set", () => {
  setSmokeTests("BP03", {
    games: 40,
    extras: {
      hand: ["BP03-111"], // a Fallen Angel follower to discard for BP03-117
      field: ["BP03-060"], // an Armed follower for BP03-072 (still under the field limit)
      // Cheap followers and trait cards that several effects select from the cemetery.
      cemetery: ["BP03-033", "BP03-036", "BP03-051", "BP03-111", "BP01-006"],
      side: { returnedToHand: 1 }, // BP03-005 evolves after a card returned to hand
    },
  });
});
