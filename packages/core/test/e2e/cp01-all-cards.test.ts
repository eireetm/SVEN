import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("CP01 whole set", () => {
  setSmokeTests("CP01", {
    games: 40,
    extras: {
      // An Umamusume follower (Shinko Windy) for the cards that select one or count Umamusume cards on your field.
      field: ["CP01-006"],
      perCard: {
        // 7 More Centimeters can only be played with 20 Umamusume cards in your cemetery.
        "CP01-057": { cemetery: Array<string>(20).fill("CP01-064") },
      },
    },
  });
});
