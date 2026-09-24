import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("BP03 whole set", () => {
  setSmokeTests("BP03", { games: 40 });
});
