import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("BP02 whole set", () => {
  setSmokeTests("BP02", { games: 40 });
});
