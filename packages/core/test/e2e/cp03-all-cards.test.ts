import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("CP03 whole set", () => {
  setSmokeTests("CP03", {
    games: 40,
    extras: {
      // A Shadow Paladin follower (Black Sage, Charon) to bury for CP03-084's additional cost.
      field: ["CP03-093"],
      // A 1-cost Aqua Force follower (Battleship Intelligence) for CP03-020 to summon from the cemetery.
      cemetery: ["CP03-015"],
    },
  });
});
