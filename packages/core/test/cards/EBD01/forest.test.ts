import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// EBD01 (its other cards are reprints). V1 is 1c 2/2 (Neutral). SD01-003 Rose Gardener evolves for 1; SD01-013 Elf Wanderer is a
// 2-cost Forestcraft follower.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("EBD01", () => {
  it("007 Spinaria, Wavering Will — a follower of yours evolving: leader +2; Fanfare: a Forestcraft follower costing 2 or less from the cemetery into the EX area, 2 less", () => {
    const t = d({ me: { hand: ["EBD01-007"], cemetery: ["SD01-013", "V1"], playPoints: 3 } }).play("EBD01-007");
    expect([t.ex(), t.canPlay("SD01-013")]).toEqual([["SD01-013"], true]);
    expect(d({ me: { field: ["EBD01-007", "SD01-003"], evolveDeck: ["SD01-004"], playPoints: 1 } }).evolve("SD01-003").flush().leader()).toBe(22);
  });
});
