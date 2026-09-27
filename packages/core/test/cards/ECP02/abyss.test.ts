import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP02 Abysscraft (047–059), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item
// (Lesson banishes them from the EX area). iM@S CG followers with only Evolve: CP02-014 Kana Imai / CP02-060 Yuka Nakano (Cute, 2c /
// 1c), CP02-042 Hina Araki / CP02-039 Kanade Hayami (Cool, 2c / 3c), CP02-047 Rika Jougasaki (Passion, 1c). CP02-103 New
// Generations has all three types. CP02-028 Sparkling☆Days is a 1-cost Cool spell.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("ECP02 Abysscraft", () => {
  it("047 Ranko Kanzaki — Ward; Fanfare: destroy; Necrocharge (5): leader +3; NC (10): 3 damage to the enemy leader; Lesson (1): draw, once per turn", () => {
    const t = d({ me: { hand: ["ECP02-047"], cemetery: Array<string>(10).fill("V1"), playPoints: 5 }, opp: { field: ["V5"] } }).play("ECP02-047").none();
    expect([t.field("opp"), t.leader(), t.leader("opp")]).toEqual([[], 23, 17]);
    const a = d({ me: { field: ["ECP02-047"], ex: [ITEM], deck: ["V1"] } }).activate("ECP02-047");
    expect([a.hand(), a.canActivate("ECP02-047")]).toEqual([["V1"], false]);
  });

  it("048 Syoko Hoshi — Fanfare: bury the top 2; act (1), Lesson (2), engage: an iM@S CG follower costing 2 or less from the cemetery into the EX area, 2 less", () => {
    expect(d({ me: { hand: ["ECP02-048"], deck: ["V1", "V3"], playPoints: 2 } }).play("ECP02-048").cemetery().sort()).toEqual(["V1", "V3"]);
    const a = d({ me: { field: ["ECP02-048"], ex: [ITEM, ITEM], cemetery: ["CP02-014"], playPoints: 1 } }).activate("ECP02-048");
    expect([a.ex(), a.canPlay("CP02-014"), a.pp()]).toEqual([["CP02-014"], true, 0]);
  });

  it("049 Mirei Hayasaka — Storm with 10 iM@S CG cards in the cemetery; Strike: 2 damage with 10", () => {
    const t = d({ me: { field: ["ECP02-049"], cemetery: Array<string>(10).fill("CP02-014") }, opp: { field: ["V5"] } });
    expect(t.keywords("ECP02-049")).toEqual(["storm"]);
    expect(t.attack("ECP02-049", "opp:leader").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: ["ECP02-049"], cemetery: Array<string>(9).fill("CP02-014") } }).keywords("ECP02-049")).toEqual([]);
  });

  it("050 / 051 Nono Morikubo — a Mirei Hayasaka or Syoko Hoshi entering your field gets +1/+1; evolved: an iM@S CG follower costing 2 or less from the top 4", () => {
    const t = d({ me: { field: ["ECP02-050"], hand: ["ECP02-049"], playPoints: 2 } }).play("ECP02-049").flush();
    expect(t.stats("ECP02-049")).toEqual([3, 4]);
    const e = d({ me: { field: ["ECP02-050"], evolveDeck: ["ECP02-051"], deck: ["V1", "CP02-047", "V3"], playPoints: 1 } }).evolve("ECP02-050").pick("CP02-047").order();
    expect(e.field()).toEqual(["ECP02-050", "CP02-047"]);
  });

  it("052 Asuka Ninomiya — Storm with 3 Cool followers; Fanfare (2), Lesson (1): a Ranko Kanzaki into the EX area, 4 less", () => {
    expect(d({ me: { field: ["ECP02-052", "CP02-042", "CP02-039"] } }).keywords("ECP02-052")).toEqual(["storm"]);
    expect(d({ me: { field: ["ECP02-052", "CP02-042"] } }).keywords("ECP02-052")).toEqual([]);
    const t = d({ me: { hand: ["ECP02-052"], ex: [ITEM], deck: ["V1", "ECP02-047"], playPoints: 5 } }).play("ECP02-052").yes().pick("ECP02-047");
    expect([t.ex(), t.canPlay("ECP02-047"), t.pp()]).toEqual([["ECP02-047"], true, 1]);
  });

  it("053 / 054 Chitose Kurosaki — Fanfare, Lesson (1): 1 damage, leader +1; evolved: 3 damage, bury the top 2", () => {
    const t = d({ me: { hand: ["ECP02-053"], ex: [ITEM], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-053").yes();
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 4], 21]);
    const e = d({ me: { field: ["ECP02-053"], evolveDeck: ["ECP02-054"], deck: ["V1", "V3"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("ECP02-053");
    expect([e.stats("opp:V5"), e.cemetery().sort()]).toEqual([[5, 2], ["V1", "V3"]]);
  });

  it("055 / 056 Natsuki Kimura — Storm with 10 Passion cards; Fanfare with an iM@S CG follower costing 5+: evolve; evolved: 2x Passion followers damage", () => {
    expect(d({ me: { field: ["ECP02-055"], cemetery: Array<string>(10).fill("CP02-047") } }).keywords("ECP02-055")).toEqual(["storm"]);
    const t = d({ me: { hand: ["ECP02-055"], field: ["ECP02-057"], evolveDeck: ["ECP02-056"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-055").yes();
    // Takumi Mukai: an iM@S CG card on your field damaged an enemy follower during your turn.
    expect([t.stats("ECP02-055"), t.stats("opp:V5"), t.leader("opp")]).toEqual([[4, 4], [5, 1], 19]);
  });

  it("057 Takumi Mukai — Rush, Assail; Fanfare: a Passion follower costing 3 or less from the cemetery; your iM@S CG card (on the field, or a spell) damages enemy followers: 1 to the leader", () => {
    expect(d({ me: { hand: ["ECP02-057"], cemetery: ["CP02-047"], playPoints: 6 } }).play("ECP02-057").field()).toEqual(["ECP02-057", "CP02-047"]);
    // Combat damage counts (ruling).
    expect(d({ me: { field: ["ECP02-057", "CP02-014"] }, opp: { field: [{ card: "V1", engaged: true }] } }).attack("CP02-014", "opp:V1").leader("opp")).toBe(19);
    // Several enemy followers damaged at once: once (ruling).
    const s = d({ me: { hand: ["ECP02-005"], field: ["ECP02-057"], playPoints: 7 }, opp: { field: ["V5", "V3"] } }).play("ECP02-005");
    expect(s.leader("opp")).toBe(19);
    // An iM@S CG spell's damage counts too (decided by the project owner): Self-Proclaimed Fan Favorite's 4 damage.
    const sp = d({ me: { field: ["ECP02-057"], hand: ["ECP02-059"], playPoints: 2 }, opp: { field: ["V5"] } }).play("ECP02-059").choose("damage");
    expect([sp.stats("opp:V5"), sp.leader("opp")]).toEqual([[5, 1], 19]);
    // An ability used from the hand (Riamu Yumemi's) is not a card on your field.
    const h = d({ me: { field: ["ECP02-057"], hand: ["ECP02-041"], ex: [ITEM], playPoints: 1 }, opp: { field: ["V5"] } }).activate("ECP02-041");
    expect([h.stats("opp:V5"), h.leader("opp")]).toEqual([[5, 3], 20]);
  });

  it("058 Koume Shirasaka — Fanfare: a Cool follower costing 3 or less from the cemetery with 3 Cool followers; act (1), Lesson (1), engage: Last Daylight into the EX area", () => {
    const t = d({ me: { hand: ["ECP02-058"], field: ["CP02-042", "CP02-039"], cemetery: ["CP02-042"], playPoints: 3 } }).play("ECP02-058");
    expect(t.field()).toEqual(["CP02-042", "CP02-039", "ECP02-058", "CP02-042"]);
    const a = d({ me: { field: ["ECP02-058"], ex: [ITEM], deck: ["V1", "CP02-085"], playPoints: 1 } }).activate("ECP02-058").pick("CP02-085");
    expect([a.ex(), a.engaged("ECP02-058")]).toEqual([["CP02-085"], true]);
  });

  it("059 Self-Proclaimed Fan Favorite — choose 1 (up to 2 with 5 Cute cards): 4 damage / a Sachiko Koshimizu with Drain / a Magical Item", () => {
    const t = d({ me: { hand: ["ECP02-059"], cemetery: Array<string>(5).fill("CP02-014"), playPoints: 2 }, opp: { field: ["V5"] } }).play("ECP02-059").choose("damage", "item");
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 1], [ITEM]]);
    const s = d({ me: { hand: ["ECP02-059"], deck: ["V1", "CP02-071"], playPoints: 2 } }).play("ECP02-059").choose("sachiko").pick("CP02-071");
    expect([s.field(), s.keywords("CP02-071"), s.leader()]).toEqual([["CP02-071"], ["drain"], 18]);
  });
});
