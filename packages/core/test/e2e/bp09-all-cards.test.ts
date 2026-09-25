import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("BP09 whole set", () => {
  setSmokeTests("BP09", {
    games: 40,
    extras: {
      // 5 Academic cards (BP09-038's evolve abilities), 5 Vampire cards (BP09-069's Blood Queen), a
      // Runecraft follower costing 3 or less (BP09-T02), Amaterasu and Tsukuyomi (BP09-105).
      cemetery: [
        "BP09-044",
        "BP09-044",
        "BP09-050",
        "BP09-050",
        "BP09-038",
        "BP09-078",
        "BP09-078",
        "BP09-082",
        "BP09-082",
        "BP09-083",
        "BP09-048",
        "BP09-108",
        "BP09-109",
      ],
      // Draconic Duelist followers for BP09-065.
      field: ["BP09-059"],
      // An amulet in hand for BP09-097's cost.
      hand: ["BP09-102"],
    },
  });
});
