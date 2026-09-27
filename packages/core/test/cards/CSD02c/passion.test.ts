import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CSD02c (CINDERELLA GIRLS starter deck, Passion). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical
// Item. CP02-047 Rika Jougasaki (1c 1/1) is a Passion follower with only Evolve.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const ITEM = "CP02-T01";
const RIKA = "CP02-047";

describe("CSD02c Passion", () => {
  it("001 Mio Honda [Positive Passion] — Rush; Fanfare and act (2), Lesson (2): a Passion follower from the top 2, the rest buried", () => {
    const t = d({ me: { hand: ["CSD02c-001"], deck: [RIKA, "V1"], playPoints: 6 } }).play("CSD02c-001").pick(RIKA);
    expect([t.field(), t.cemetery(), t.keywords("CSD02c-001")]).toEqual([["CSD02c-001", RIKA], ["V1"], ["rush"]]);
    const a = d({ me: { field: ["CSD02c-001"], ex: [ITEM, ITEM], deck: ["V1", RIKA], playPoints: 2 } }).activate("CSD02c-001").pick(RIKA);
    expect([a.field(), a.ex()]).toEqual([["CSD02c-001", RIKA], []]);
  });

  it("002 Aiko Takamori [Handmade Happiness] — act, engage 3 Passion followers (this one too): a Passion follower from the hand, back to the hand at the end", () => {
    const t = d({ me: { field: ["CSD02c-002", RIKA, RIKA], hand: [RIKA] }, opp: { deck: ["V1"] } }).activate("CSD02c-002").pick(RIKA);
    expect([t.field().length, t.engaged("CSD02c-002"), t.hand()]).toEqual([4, true, []]);
    expect(t.end().hand()).toEqual([RIKA]);
  });

  it("003 Akane Hino [Positive Passion] — Storm; Fanfare, Lesson (3), discard 2 Passion cards: 6 damage to each enemy follower, draw 2", () => {
    const t = d({ me: { hand: ["CSD02c-003", RIKA, RIKA], ex: [ITEM, ITEM, ITEM], deck: ["V1", "V3"], playPoints: 8 }, opp: { field: ["V5"] } });
    t.play("CSD02c-003").yes();
    expect([t.field("opp"), t.hand(), t.ex()]).toEqual([[], ["V1", "V3"], []]);
  });

  it("004 Kaoru Ryuzaki — act (2) with 5 Passion cards in the cemetery: a follower from the cemetery to the hand, once per turn", () => {
    const t = d({ me: { field: ["CSD02c-004"], cemetery: [...n(5, RIKA), "V5"], playPoints: 2 } }).activate("CSD02c-004").pick("V5");
    expect([t.hand(), t.canActivate("CSD02c-004")]).toEqual([["V5"], false]);
    const u = d({ me: { field: ["CSD02c-004"], cemetery: [...n(4, RIKA), "V5"], playPoints: 2 } }).activate("CSD02c-004");
    expect([u.hand(), u.pp()]).toEqual([[], 0]);
  });

  it("005 / 006 Suzuho Ueda — Fanfare: look at the top card; evolved: damage equal to the revealed top card's cost", () => {
    expect(d({ me: { hand: ["CSD02c-005"], deck: ["V1"], playPoints: 3 } }).play("CSD02c-005").zone("me", "deck")).toEqual(["V1"]);
    const e = d({ me: { field: ["CSD02c-005"], evolveDeck: ["CSD02c-006"], deck: ["V3"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CSD02c-005");
    expect([e.stats("opp:V5"), e.zone("me", "deck")]).toEqual([[5, 2], ["V3"]]);
  });

  it("007 / 008 Miria Akagi — Fanfare (2), Lesson (1): +1/+1; evolved, discard a Passion card: draw 2", () => {
    expect(d({ me: { hand: ["CSD02c-007"], ex: [ITEM], playPoints: 4 } }).play("CSD02c-007").yes().stats("CSD02c-007")).toEqual([3, 3]);
    const e = d({ me: { field: ["CSD02c-007"], evolveDeck: ["CSD02c-008"], hand: [RIKA], deck: ["V1", "V3"], playPoints: 1 } }).evolve("CSD02c-007").yes();
    expect(e.hand()).toEqual(["V1", "V3"]);
  });

  it("009 Miu Yaguchi — Ward; Fanfare: bury the top card; odd cost: draw, even: leader +2", () => {
    expect(d({ me: { hand: ["CSD02c-009"], deck: ["V1", "V3"], playPoints: 3 } }).play("CSD02c-009").none().hand()).toEqual(["V3"]);
    const e = d({ me: { hand: ["CSD02c-009"], deck: ["V2", "V3"], playPoints: 3 } }).play("CSD02c-009").none();
    expect([e.leader(), e.hand(), e.cemetery()]).toEqual([22, [], ["V2"]]);
  });

  it("010 / 011 Kumiko Matsuyama — evolved: a Passion follower costing 3 or less from the cemetery", () => {
    const e = d({ me: { field: ["CSD02c-010"], evolveDeck: ["CSD02c-011"], cemetery: [RIKA], playPoints: 1 } }).evolve("CSD02c-010");
    expect(e.field()).toEqual(["CSD02c-010", RIKA]);
  });
});
