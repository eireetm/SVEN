import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// The busy scenario's field already holds 3 cards (4 with an evolved card's base), so per-card
// fields below list everything they need.
const PUPPET = "BP05-T03";
const SERPENT = "BP04-T01";

describe("BP08 whole set", () => {
  setSmokeTests("BP08", {
    games: 40,
    extras: {
      // Puppetry (BP08-002's second evolve, BP08-010), Hunter (BP08-015, 017), Assassin (BP08-029),
      // Mage (BP08-047), Departed (BP08-073) and cheap Swordcraft / Havencraft / Abysscraft followers.
      cemetery: [
        "BP08-012", "BP08-012", "BP08-012",
        "BP08-015", "BP08-015", "BP08-007",
        "BP08-029", "BP08-029",
        "BP08-042", "BP08-044", "BP08-047",
        "BP08-076", "BP08-081",
        "BP08-093", "BP08-099",
      ],
      hand: ["BP08-024", "BP08-044", "BP08-106"],
      opponentsTurn: ["BP08-092"],
      perCard: {
        "BP08-004": { ex: [PUPPET] },
        "BP08-011": { ex: [PUPPET, PUPPET] },
        // Two Serpents to bury for the evolved Medusa's Quick ability.
        "BP08-036": { field: ["BP08-035", SERPENT, SERPENT] },
        // A Morra to engage for Monika's ability.
        "BP08-040": { field: ["BP08-044", "BP01-042"] },
        // A Durandal for the evolved Roland's end phase draw.
        "BP08-022": { field: ["BP08-021", "BP08-024"] },
        // Facedown evolved followers for the Fanfare cost.
        "BP08-053": { evolveDeck: ["BP08-020", "BP08-026", "BP08-033"] },
        "BP08-054": { faceUpEvolveDeck: ["BP08-020", "BP08-026", "BP08-033", "BP08-036", "BP08-043", "BP08-049", "BP08-054", "BP08-056"] },
        "BP08-110": { faceUpEvolveDeck: ["BP08-020", "BP08-026"] },
        "BP08-111": { faceUpEvolveDeck: ["BP08-020", "BP08-026"] },
        "BP08-075": { cemetery: ["BP05-070", ...Array<string>(10).fill("BP08-081")] },
        // One card of each base cost 1–10 for the Prophetess's cost option.
        "BP08-037": {
          cemetery: [
            "BP01-012", "BP01-002", "BP01-008", "BP01-021", "BP01-006",
            "BP01-091", "BP01-007", "BP01-001", "BP01-061", "BP01-154",
          ],
        },
        // Amulets for Eidolon of Madness and Godsworn Alexiel.
        "BP08-089": { field: ["BP08-024", "BP08-102", "BP01-T10"] },
        "BP08-090": { field: ["BP08-089", "BP08-024", "BP08-102"] },
        "BP08-088": { field: ["BP08-087", "BP08-024", "BP08-102"] },
      },
    },
  });
});
