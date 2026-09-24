import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("BP04 whole set", () => {
  setSmokeTests("BP04", {
    games: 40,
    extras: {
      field: ["BP04-025"], // a Commander follower for BP04-026 Cyclone Blade
    },
  });
});
