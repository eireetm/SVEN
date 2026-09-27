import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP02 Swordcraft (018–034), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral).
// CP02-T01 is a Magical Item (Lesson banishes them from the EX area). iM@S CG followers without abilities besides Evolve:
// CP02-014 (Cute, 2c), CP02-032 (Cute, 2c), CP02-047 (Passion, 1c).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const ITEM = "CP02-T01";

describe("CP02 Swordcraft", () => {
  it("018 / 019 Kyoko Igarashi — Ward; Fanfare: leader +3, draw 2; evolved: engage or refresh up to 1 enemy follower, no damage during your turn", () => {
    const t = d({ me: { hand: ["CP02-018"], deck: ["V1", "V1"], playPoints: 7 } }).play("CP02-018").none();
    expect([t.leader(), t.hand().length]).toEqual([23, 2]);
    const r = d({ me: { field: ["CP02-018"], evolveDeck: ["CP02-019"], playPoints: 1 }, opp: { field: [{ card: "V5", engaged: true }] } });
    r.evolve("CP02-018").pick("opp:V5").choose("refresh");
    expect(r.engaged("opp:V5")).toBe(false);
    const e = d({ me: { field: ["CP02-018"], evolveDeck: ["CP02-019"], playPoints: 1 }, opp: { field: [{ card: "V5", engaged: true }] } });
    e.evolve("CP02-018").pick("opp:V5").choose("engage").attack("CP02-018", "opp:V5");
    expect([e.stats("CP02-018"), e.field("opp")]).toEqual([[7, 8], []]);
  });

  it("020 Nagi Hisakawa — Fanfare, banish two 1-cost cards from the cemetery: up to 2 options; act (1), Lesson (1): Rush", () => {
    const t = d({ me: { hand: ["CP02-020"], cemetery: ["V1", "CP02-047"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP02-020");
    t.choose("1", "2").yes();
    expect([t.field("opp"), t.leader("opp"), t.zone("me", "cemetery")]).toEqual([[], 18, []]);
    // The options are chosen first; the cost may then be left unpaid, and nothing happens (ruling).
    const unpaid = d({ me: { hand: ["CP02-020", "V3"], cemetery: ["V1", "CP02-047"], deck: ["V5"], playPoints: 4 } }).play("CP02-020");
    unpaid.choose("3").no();
    expect([unpaid.hand(), unpaid.cemetery()]).toEqual([["V3"], ["V1", "CP02-047"]]);
    expect(d({ me: { field: ["CP02-020"], ex: [ITEM], playPoints: 1 } }).activate("CP02-020").keywords("CP02-020")).toEqual(["rush"]);
  });

  it("021 Rin Shibuya — Ward; Fanfare with an Uzuki Shimamura: 5 damage; with a Mio Honda: 5 to the enemy leader", () => {
    const t = d({ me: { hand: ["CP02-021"], field: ["CP02-023", "CP02-022"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP02-021").none().flush();
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 15]);
    const alone = d({ me: { hand: ["CP02-021"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP02-021").none().flush();
    expect([alone.stats("opp:V5"), alone.leader("opp")]).toEqual([[5, 5], 20]);
  });

  it("022 Mio Honda — Storm; Strike with an Uzuki Shimamura: +0/+1; with a Rin Shibuya: +1/+0", () => {
    const t = d({ me: { field: ["CP02-022", "CP02-023", "CP02-021"] } }).attack("CP02-022", "opp:leader").flush();
    expect([t.stats("CP02-022"), t.leader("opp"), t.keywords("CP02-022")]).toEqual([[3, 2], 17, ["storm"]]);
  });

  it("023 / 024 Uzuki Shimamura — Fanfare, Lesson (1): leader +1; evolved: a Rin Shibuya / Mio Honda follower from the deck into the EX area, 2 less this turn", () => {
    const t = d({ me: { hand: ["CP02-023"], ex: [ITEM], playPoints: 3 } }).play("CP02-023").yes();
    expect([t.leader(), t.ex()]).toEqual([21, []]);
    const e = d({ me: { field: ["CP02-023"], evolveDeck: ["CP02-024"], deck: ["V1", "CP02-021"], playPoints: 3 } }).evolve("CP02-023").pick("CP02-021");
    expect([e.ex(), e.pp(), e.canPlay("CP02-021@ex")]).toEqual([["CP02-021"], 2, true]);
  });

  it("025 Anzu Futaba — Fanfare with 2 iM@S CG followers or less: engage; not refreshed in the start phase; main phase (2): refresh", () => {
    expect(d({ me: { hand: ["CP02-025"], playPoints: 1 } }).play("CP02-025").engaged("CP02-025")).toBe(true);
    expect(d({ me: { hand: ["CP02-025"], field: ["CP02-014", "CP02-032"], playPoints: 1 } }).play("CP02-025").engaged("CP02-025")).toBe(false);
    const t = d({ me: { field: [{ card: "CP02-025", engaged: true }], deck: ["V1", "V1"], maxPlayPoints: 4 }, opp: { deck: ["V1"] } }).end().end();
    expect(t.engaged("CP02-025")).toBe(true);
    t.yes();
    expect([t.engaged("CP02-025"), t.pp()]).toEqual([false, 3]);
  });

  it("026 / 027 Karen Hojo — Fanfare with 3 iM@S CG followers: +0/+2; evolved: 3 damage to an enemy follower and to itself", () => {
    expect(d({ me: { hand: ["CP02-026"], field: ["CP02-014", "CP02-032"], playPoints: 2 } }).play("CP02-026").stats("CP02-026")).toEqual([1, 3]);
    const e = d({ me: { field: ["CP02-026"], evolveDeck: ["CP02-027"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP02-026");
    expect([e.stats("opp:V5"), e.field()]).toEqual([[5, 2], []]);
  });

  it("028 Sparkling☆Days — a Cool or Passion card from the top 2", () => {
    expect(d({ me: { hand: ["CP02-028"], deck: ["V1", "CP02-026"], playPoints: 1 } }).play("CP02-028").pick("CP02-026").hand()).toEqual(["CP02-026"]);
  });

  it("029 Nao Kamiya — Fanfare with 3 iM@S CG followers: 2 damage", () => {
    expect(d({ me: { hand: ["CP02-029"], field: ["CP02-014", "CP02-032"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP02-029").stats("opp:V5")).toEqual([5, 3]);
  });

  it("030 Mayu Sakuma — Assail, Bane, Drain", () => {
    expect(d({ me: { field: ["CP02-030"] } }).keywords("CP02-030")).toEqual(["assail", "bane", "drain"]);
  });

  it("031 Kirari Moroboshi — 3 less with a 1-cost follower on your field; Ward; Fanfare: refresh your followers", () => {
    const t = d({ me: { hand: ["CP02-031"], field: [{ card: "V1", engaged: true }], playPoints: 6 } }).play("CP02-031").none();
    expect([t.engaged("V1"), t.pp()]).toEqual([false, 0]);
    expect(d({ me: { hand: ["CP02-031"], field: ["V2"], playPoints: 6 } }).canPlay("CP02-031")).toBe(false);
  });

  it("032 / 033 Miho Kohinata — evolved: 2 damage, 3 with 5 Cute cards in your cemetery", () => {
    const e = (cute: number) =>
      d({ me: { field: ["CP02-032"], evolveDeck: ["CP02-033"], cemetery: n(cute, "CP02-014"), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP02-032");
    expect([e(5).stats("opp:V5"), e(4).stats("opp:V5")]).toEqual([[5, 2], [5, 3]]);
  });

  it("034 Angelic Maid — Quick; +1/+3 to a follower of yours and leader +3", () => {
    const t = d({ me: { hand: ["CP02-034"], field: ["V1"], playPoints: 2 } }).play("CP02-034");
    expect([t.stats("V1"), t.leader()]).toEqual([[3, 5], 23]);
    expect(d({ me: { hand: ["CP02-034"], playPoints: 2 } }).canPlay("CP02-034")).toBe(false);
  });
});
