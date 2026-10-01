import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// BP22 is a pre-release set (data/preview.ts): its cards have their Japanese names. Its Umamusume cards (BP22-116–118) make the
// smoke test give the player that universe, so serving has Carrots.
// Per-card settings replace the whole zone, so they list everything the card needs.
const BUSY_FIELD = ["BP01-T10", "BP01-042", { card: "BP01-173", engaged: true }];

describe("BP22 whole set", () => {
  setSmokeTests("BP22", {
    games: 40,
    extras: {
      perCard: {
        // カースメーカー・スージー (evolved): its base evolves only with 10 cards that cost 2 in the cemetery.
        "BP22-079": { cemetery: Array<string>(10).fill("BP22-080") },
        // 鏡像の召喚 selects a token follower of yours.
        "BP22-055": { field: ["BP01-T08", ...BUSY_FIELD] },
      },
    },
  });
});
