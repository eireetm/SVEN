import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CSD02a (CINDERELLA GIRLS starter deck, Cute). V1 is 1c 2/2, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item (Lesson banishes them
// from the EX area). Cute followers with only Evolve: CP02-014 Kana Imai (2c 2/2), CP02-032 Miho Kohinata (2c 2/2), CP02-060 Yuka
// Nakano (1c 1/2).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const ITEM = "CP02-T01";

describe("CSD02a Cute", () => {
  it("001 Uzuki Shimamura [P.C.S.] — Fanfare: up to a Cute follower costing 4 or less and one costing 2 or less from the cemetery, +1/+1; act, Lesson (1): leader +3 once per turn", () => {
    const t = d({ me: { hand: ["CSD02a-001"], cemetery: ["CP02-014", "CP02-060", "V1"], playPoints: 7 } }).play("CSD02a-001");
    t.pick("CP02-014").pick("CP02-060").flush();
    expect([t.field(), t.stats("CP02-014"), t.stats("CP02-060")]).toEqual([["CSD02a-001", "CP02-014", "CP02-060"], [3, 3], [2, 3]]);
    const a = d({ me: { field: ["CSD02a-001"], ex: [ITEM, ITEM] } }).activate("CSD02a-001");
    expect([a.leader(), a.ex(), a.canActivate("CSD02a-001")]).toEqual([23, [ITEM], false]);
  });

  it("002 Kyoko Igarashi [P.C.S.] — Ward; Fanfare: -X/-X for the Cute followers on your field; act, Lesson (1): -1/-1", () => {
    const t = d({ me: { hand: ["CSD02a-002"], field: ["CP02-014"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CSD02a-002").none();
    expect(t.stats("opp:V5")).toEqual([3, 3]);
    expect(d({ me: { field: ["CSD02a-002"], ex: [ITEM] }, opp: { field: ["V5"] } }).activate("CSD02a-002").stats("opp:V5")).toEqual([4, 4]);
  });

  it("003 Miho Kohinata [P.C.S] — Fanfare: may take the top card if Cute; Rush with 3 Cute followers on your field", () => {
    const t = d({ me: { hand: ["CSD02a-003"], field: ["CP02-014", "CP02-060"], deck: ["CP02-032"], playPoints: 2 } }).play("CSD02a-003").pick("CP02-032");
    expect([t.hand(), t.keywords("CSD02a-003")]).toEqual([["CP02-032"], ["rush"]]);
    expect(d({ me: { hand: ["CSD02a-003"], field: ["CP02-014"], deck: ["V1"], playPoints: 2 } }).play("CSD02a-003").keywords("CSD02a-003")).toEqual([]);
  });

  it("004 Chika Yokoyama — Fanfare with 5 Cute cards in the cemetery: +1/+2 and Ward", () => {
    const t = d({ me: { hand: ["CSD02a-004"], cemetery: n(5, "CP02-014"), playPoints: 1 } }).play("CSD02a-004");
    expect([t.stats("CSD02a-004"), t.keywords("CSD02a-004")]).toEqual([[3, 4], ["ward"]]);
  });

  it("005 / 006 Momoka Sakurai — Fanfare (2), Lesson (1): +1/+1; evolved: a Cute card from the top 3", () => {
    const t = d({ me: { hand: ["CSD02a-005"], ex: [ITEM], playPoints: 4 } }).play("CSD02a-005").yes();
    expect([t.stats("CSD02a-005"), t.pp(), t.ex()]).toEqual([[3, 3], 0, []]);
    const e = d({ me: { field: ["CSD02a-005"], evolveDeck: ["CSD02a-006"], deck: ["V1", "CP02-014", "V5"], playPoints: 1 } }).evolve("CSD02a-005");
    expect(e.pick("CP02-014").order().hand()).toEqual(["CP02-014"]);
  });

  it("007 / 008 Akiha Ikebukuro — Fanfare: another Cute follower +1 defense; evolved, discard a Cute card: 3 damage and draw", () => {
    expect(d({ me: { hand: ["CSD02a-007"], field: ["CP02-014"], playPoints: 3 } }).play("CSD02a-007").stats("CP02-014")).toEqual([2, 3]);
    const e = d({ me: { field: ["CSD02a-007"], evolveDeck: ["CSD02a-008"], hand: ["CP02-014"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    e.evolve("CSD02a-007").yes();
    expect([e.stats("opp:V5"), e.hand(), e.cemetery()]).toEqual([[5, 2], ["V1"], ["CP02-014"]]);
  });

  it("009 / 010 Nene Kurihara — Ward; Fanfare: 3 damage; evolved, (3): a Cute follower from the cemetery", () => {
    expect(d({ me: { hand: ["CSD02a-009"], playPoints: 5 }, opp: { field: ["V5"] } }).play("CSD02a-009").none().stats("opp:V5")).toEqual([5, 2]);
    const e = d({ me: { field: ["CSD02a-009"], evolveDeck: ["CSD02a-010"], cemetery: ["CP02-014"], playPoints: 4 } }).evolve("CSD02a-009").yes();
    expect([e.field(), e.pp()]).toEqual([["CSD02a-009", "CP02-014"], 0]);
  });

  it("011 Karin Domyoji — Ward; Fanfare, discard a Cute card: +2 defense, draw", () => {
    const t = d({ me: { hand: ["CSD02a-011", "CP02-014"], deck: ["V1"], playPoints: 3 } }).play("CSD02a-011").none().yes();
    expect([t.stats("CSD02a-011"), t.hand()]).toEqual([[3, 5], ["V1"]]);
  });
});
