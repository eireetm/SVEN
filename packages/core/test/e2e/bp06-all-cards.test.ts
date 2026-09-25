import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("BP06 whole set", () => {
  setSmokeTests("BP06", {
    games: 40,
    extras: {
      // Cards to pay costs with: a Hunter card (BP06-013), an Academic follower (BP06-037), a
      // Yokai card (BP06-085).
      hand: ["BP06-012", "BP06-037", "BP06-084"],
      // Hunter, Yokai and Ward followers and Onmyoji cards for cemetery conditions and costs.
      cemetery: ["BP06-012", "BP06-012", "BP06-084", "BP06-084", "BP06-097", "BP06-097", "BP06-097", "BP06-048"],
      // Two reserved Hunter followers (BP06-017), a Swordcraft follower (BP06-034), a Shikigami
      // follower (BP06-039), a Golem follower (BP06-052).
      field: ["BP06-012"],
      // A used evolved follower for BP06-117.
      side: { faceUpEvolveDeck: ["BP06-002"] },
      // "This card can't be played during your turn."
      opponentsTurn: ["BP06-105", "BP06-106"],
    },
  });
});
