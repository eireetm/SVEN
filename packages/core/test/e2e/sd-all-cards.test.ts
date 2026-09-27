import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

// The classic starter and deck products (SD01–SD08): mostly reprints; their new cards are checked together.
describe("SD01–SD08 new cards", () => {
  setSmokeTests(["SD01", "SD02", "SD03", "SD04", "SD05", "SD06", "SD07", "SD08"], { games: 40 });
});
