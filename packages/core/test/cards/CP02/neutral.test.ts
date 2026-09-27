import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP02 Neutral (103–108) and the Magical Item token, THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V5 5c 5/5 (Neutral).
// AMULET is a 1-cost amulet. iM@S CG followers without abilities besides Evolve: CP02-014 (Cute, 2c), CP02-047 (Passion, 1c);
// CP02-026 is Cool (2c; a Fanfare that does nothing alone). CP02-103 has all three types.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const ITEM = "CP02-T01";

describe("CP02 Neutral", () => {
  it("103 New Generations — banish 3 Cute, 3 Cool and 3 Passion cards from your cemetery: 9 less; Storm, Bane, Ward", () => {
    const nine = [...n(3, "CP02-014"), ...n(3, "CP02-026"), ...n(3, "CP02-047")];
    const t = d({ me: { hand: ["CP02-103"], cemetery: nine, playPoints: 1 } }).play("CP02-103");
    // One card at a time; the last card of each group is the only candidate left, answered automatically.
    for (const c of ["CP02-014", "CP02-014", "CP02-026", "CP02-026", "CP02-047", "CP02-047"]) t.pick(c);
    t.none();
    expect([t.cemetery(), t.keywords("CP02-103"), t.pp()]).toEqual([[], ["storm", "bane", "ward"], 0]);
    expect(d({ me: { hand: ["CP02-103"], cemetery: nine.slice(1), playPoints: 1 } }).canPlay("CP02-103")).toBe(false);
    // A card with all three types counts as one card of any one of them; 9 different cards are needed (rulings).
    const withNewGenerations = (others: string[]) =>
      d({ me: { hand: ["CP02-103"], cemetery: [...n(3, "CP02-103"), ...others], playPoints: 1 } }).canPlay("CP02-103");
    expect([withNewGenerations([...n(3, "CP02-014"), ...n(3, "CP02-026")]), withNewGenerations(n(6, "CP02-014"))]).toEqual([true, false]);
    const mixed = d({ me: { hand: ["CP02-103"], cemetery: ["CP02-103", ...n(3, "CP02-014"), ...n(2, "CP02-026"), ...n(3, "CP02-047")], playPoints: 1 } });
    // It is needed for a Cool slot, so it is not offered for a Cute one.
    expect(mixed.play("CP02-103").decision).toMatchObject({ type: "selectCards", candidateDefs: n(3, "CP02-014") });
  });

  it("104 New Wave — Fanfare, Lesson (5): destroy each enemy card on the field", () => {
    const t = d({ me: { hand: ["CP02-104"], ex: n(5, ITEM), playPoints: 6 }, opp: { field: ["V5", "AMULET"] } }).play("CP02-104").yes();
    expect([t.field("opp"), t.ex()]).toEqual([[], []]);
    expect(d({ me: { hand: ["CP02-104"], ex: n(4, ITEM), playPoints: 6 }, opp: { field: ["V5"] } }).play("CP02-104").field("opp")).toEqual(["V5"]);
  });

  it("105 Master Trainer — Fanfare: 5 Magical Items into the EX area, as many as fit; recover 4", () => {
    const t = d({ me: { hand: ["CP02-105"], ex: ["V1", "V1", "V1"], playPoints: 8 } }).play("CP02-105");
    expect([t.ex(), t.pp()]).toEqual([["V1", "V1", "V1", ITEM, ITEM], 4]);
  });

  it("106 Expert Trainer — Fanfare: 2 Magical Items into the EX area", () => {
    expect(d({ me: { hand: ["CP02-106"], playPoints: 4 } }).play("CP02-106").ex()).toEqual([ITEM, ITEM]);
  });

  it("107 Trainer — Fanfare: Bane or Drain to another iM@S CG follower", () => {
    expect(d({ me: { hand: ["CP02-107"], field: ["CP02-014"], playPoints: 2 } }).play("CP02-107").choose("drain").keywords("CP02-014")).toEqual(["drain"]);
  });

  it("108 Rookie Trainer — act, engage: +1/+0 to another iM@S CG follower", () => {
    expect(d({ me: { field: ["CP02-108", "CP02-014", "V1"] } }).activate("CP02-108").stats("CP02-014")).toEqual([3, 2]);
  });

  it("T01 Magical Item — leader +1 and draw; played from the EX area for 4; every printing is the card named Magical Item", () => {
    const t = d({ me: { ex: [ITEM], deck: ["V1"], playPoints: 4 } }).play(`${ITEM}@ex`);
    expect([t.leader(), t.hand(), t.ex(), t.cemetery()]).toEqual([21, ["V1"], [], []]);
    expect(["CP02-T05", "CP02-T09", "CSD02b-T01"].map((p) => E.db.ofPrinting(p).id)).toEqual([ITEM, ITEM, ITEM]);
  });
});
