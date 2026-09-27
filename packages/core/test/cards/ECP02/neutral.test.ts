import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP02 Neutral (072; T01–T14 are Magical Items), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item
// (Lesson banishes them from the EX area). iM@S CG followers with only Evolve: CP02-014 Kana Imai / CP02-060 Yuka Nakano (Cute, 2c /
// 1c), CP02-042 Hina Araki / CP02-039 Kanade Hayami (Cool, 2c / 3c), CP02-047 Rika Jougasaki (Passion, 1c). CP02-103 New
// Generations has all three types. CP02-028 Sparkling☆Days is a 1-cost Cool spell.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("ECP02 Neutral", () => {
  it("072 Curtain Call of Smiles — 5 less with 10 iM@S CG cards in the cemetery; destroy each non-iM@S CG follower, 2 Magical Items, leader +4, draw 2", () => {
    const t = d({ me: { hand: ["ECP02-072"], field: ["CP02-014", "V1"], cemetery: Array<string>(10).fill("CP02-047"), deck: ["V1", "V3"], playPoints: 7 }, opp: { field: ["V5"] } });
    t.play("ECP02-072");
    expect([t.field(), t.field("opp"), t.ex(), t.leader(), t.hand()]).toEqual([["CP02-014"], [], [ITEM, ITEM], 24, ["V1", "V3"]]);
    // A full EX area gets no Magical Item; the rest still happens (ruling).
    const full = d({ me: { hand: ["ECP02-072"], ex: [ITEM, ITEM, ITEM, ITEM, ITEM], deck: ["V1", "V3"], playPoints: 12 } }).play("ECP02-072");
    expect([full.ex().length, full.leader(), full.hand()]).toEqual([5, 24, ["V1", "V3"]]);
  });

  it("the SP / U printings are the cards named in small type; T01–T14 are Magical Items", () => {
    const db = E.db;
    expect(["ECP02-SP01", "ECP02-U03a", "ECP02-SP09", "ECP02-U05b", "ECP02-SP07a"].map((p) => db.ofPrinting(p).id)).toEqual([
      "ECP02-004",
      "ECP02-012",
      "ECP02-047",
      "ECP02-027",
      "ECP02-040",
    ]);
    expect(["ECP02-T01", "ECP02-T14", "ECP02-SL40"].map((p) => db.ofPrinting(p).name)).toEqual(["Magical Item", "Magical Item", "Magical Item"]);
  });
});
