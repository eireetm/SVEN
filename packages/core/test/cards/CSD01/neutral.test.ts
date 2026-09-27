import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CSD01 (Umamusume starter deck; its other cards are reprints). V1 is 1c 2/2 (Neutral). CP01-023 Narita Taishin (2c 3/2) and CP01-022
// Sirius Symboli (4c 4/4) are Umamusume followers; a field card `{ card, racing: 1 }` is racing.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("CSD01", () => {
  it("007 Tazuna Hayakawa — Ward; Fanfare: an Umamusume follower or amulet costing 4 or less from the cemetery onto the field", () => {
    const t = d({ me: { hand: ["CSD01-007"], cemetery: ["CP01-023", "CP01-022", "V1"], playPoints: 6 } }).play("CSD01-007").none().pick("CP01-022");
    expect([t.field(), t.cemetery()]).toEqual([["CSD01-007", "CP01-022"], ["CP01-023", "V1"]]);
  });

  it("030 Riko Kashimoto — act, engage: an Umamusume follower +1 attack (+2 if racing)", () => {
    expect(d({ me: { field: ["CSD01-030", "CP01-023"] } }).activate("CSD01-030").stats("CP01-023")).toEqual([4, 2]);
    expect(d({ me: { field: ["CSD01-030", { card: "CP01-023", racing: 1 }] } }).activate("CSD01-030").stats("CP01-023")).toEqual([5, 2]);
  });

  it("031 Aoi Kiryuin — act, engage: an Umamusume follower +1 defense (+2 if racing)", () => {
    expect(d({ me: { field: ["CSD01-031", "CP01-023"] } }).activate("CSD01-031").stats("CP01-023")).toEqual([3, 3]);
    expect(d({ me: { field: ["CSD01-031", { card: "CP01-023", racing: 1 }] } }).activate("CSD01-031").stats("CP01-023")).toEqual([3, 4]);
  });
});
