import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP13 Abysscraft (071–087, T03, T04). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral);
// QUICK-SAC destroys one of your followers. BP13-087 Sanguine Necklace deals 1 to your leader (a loss of
// defense). Departed followers: BP13-080 Silversteel Blader (2), BP13-085 Bandage Connoisseur (6).
// Tokens: BP13-T03 Blood Arts, BP13-T04 Darkest Desire, BP01-T14 Ghost.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const BLOOD_ARTS = "BP13-T03";
const DESIRE = "BP13-T04";
const GHOST = "BP01-T14";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP13 Abysscraft", () => {
  it("071 Aluzard — Last Words: into the EX area with 2 dormancy counters (not playable from there then); at the start of your main phase remove one, summoned when none are left", () => {
    const t = d({ me: { field: ["BP13-071"], hand: ["QUICK-SAC"], deck: n(4), playPoints: 2 }, opp: { deck: n(4) } }).play("QUICK-SAC");
    expect([t.ex(), t.counters("BP13-071@ex", "dormancy"), t.canPlay("BP13-071@ex")]).toEqual([["BP13-071"], 2, false]);
    // The cost may be left unpaid (ruling).
    t.end().end().no();
    expect(t.counters("BP13-071@ex", "dormancy")).toBe(2);
    t.end().end().yes();
    expect([t.ex(), t.counters("BP13-071@ex", "dormancy")]).toEqual([["BP13-071"], 1]);
    t.end().end().yes();
    expect([t.ex(), t.field()]).toEqual([[], ["BP13-071"]]);
  });

  it("072 Aluzard (Evolved) — Last Words: it and a Blood Arts into the EX area; with room for one, the player chooses (ruling)", () => {
    const t = d({ me: { field: [{ card: "BP13-071", evolvedInto: "BP13-072" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect([t.ex(), t.counters("BP13-071@ex", "dormancy"), t.zone("me", "evolveDeck")]).toEqual([["BP13-071", BLOOD_ARTS], 2, ["BP13-072"]]);
    const one = d({ me: { field: [{ card: "BP13-071", evolvedInto: "BP13-072" }], hand: ["QUICK-SAC"], ex: n(4) } }).play("QUICK-SAC").choose("token");
    expect([one.ex(), one.cemetery()]).toEqual([[...n(4), BLOOD_ARTS], ["BP13-071", "QUICK-SAC"]]);
  });

  it("T03 Blood Arts — 1 to your leader and each enemy follower; Aluzards +1 and Drain, +3/+3 more with 3 faceup evolved Aluzards", () => {
    const spec = (used: number): DriveSpec => ({
      me: { field: ["BP13-071"], ex: [BLOOD_ARTS], faceUpEvolveDeck: n(used, "BP13-072"), playPoints: 1 },
      opp: { field: ["V1", "V3"] },
    });
    const t = d(spec(3)).play(`${BLOOD_ARTS}@ex`);
    expect([t.leader(), t.stats("opp:V1"), t.stats("opp:V3"), t.stats("BP13-071"), t.keywords("BP13-071")]).toEqual([19, [2, 1], [3, 3], [6, 5], ["drain"]]);
    expect(d(spec(2)).play(`${BLOOD_ARTS}@ex`).stats("BP13-071")).toEqual([3, 2]);
  });

  it("073 Laura — during your turn, when your leader loses defense: an option not chosen this turn (damage equal to the times, +1/+1, Storm)", () => {
    const t = d({ me: { field: ["BP13-073", ...n(4, "BP13-087")], deck: n(4) }, opp: { field: ["V5"] } });
    t.activate("BP13-087").choose("damage");
    expect(t.stats("opp:V5")).toEqual([5, 4]);
    t.activate("BP13-087").choose("storm").activate("BP13-087"); // only (2) is left
    expect([t.stats("BP13-073"), t.keywords("BP13-073"), t.leader()]).toEqual([[4, 3], ["storm"], 17]);
    t.activate("BP13-087"); // nothing left to choose
    expect([t.stats("opp:V5"), t.stats("BP13-073"), t.leader()]).toEqual([[5, 4], [4, 3], 16]);
    // (1) can't be chosen without a target (ruling).
    const none = d({ me: { field: ["BP13-073", "BP13-087"], deck: ["V1"] } }).activate("BP13-087");
    expect(() => none.choose("damage")).toThrow(/not an option/);
  });

  it("074 / 075 Ceres — Bane; Last Words: 3 damage; evolved: a Darkest Desire into the EX area", () => {
    const t = d({ me: { field: ["BP13-074"], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } });
    expect(t.keywords("BP13-074")).toEqual(["bane"]);
    expect(t.play("QUICK-SAC").stats("opp:V5")).toEqual([5, 2]);
    const evo = d({ me: { field: ["BP13-074"], evolveDeck: ["BP13-075"], playPoints: 1 } }).evolve("BP13-074");
    expect([evo.ex(), evo.keywords("BP13-074")]).toEqual([[DESIRE], ["bane"]]);
  });

  it("T04 Darkest Desire — bury 2 followers: 2 to the enemy leader, leader +2; not playable without", () => {
    const t = d({ me: { ex: [DESIRE], field: ["V1", "V2", "V3"], playPoints: 1 } }).play(`${DESIRE}@ex`).pick("V1", "V2");
    expect([t.leader("opp"), t.leader(), t.cemetery(), t.field()]).toEqual([18, 22, ["V1", "V2"], ["V3"]]);
    expect(d({ me: { ex: [DESIRE], field: ["V1"], playPoints: 1 } }).canPlay(`${DESIRE}@ex`)).toBe(false);
  });

  it("076 Kagero — Rush and Bane with Necrocharge 10; Fanfare: a Soulstrike into the EX area (2 less with NC 20) or bury the top 2", () => {
    expect(d({ me: { field: ["BP13-076"], cemetery: n(10) } }).keywords("BP13-076")).toEqual(["rush", "bane"]);
    expect(d({ me: { field: ["BP13-076"], cemetery: n(9) } }).keywords("BP13-076")).toEqual([]);
    const spec = (others: number): DriveSpec => ({
      me: { hand: ["BP13-076"], cemetery: ["BP13-081", ...n(others)], deck: ["V1", "V2", "V3"], playPoints: 2 },
      opp: { field: ["V5"] },
    });
    const t = d(spec(19)).play("BP13-076").choose("soulstrike");
    expect([t.ex(), t.canPlay("BP13-081@ex")]).toEqual([["BP13-081"], true]);
    expect(d(spec(18)).play("BP13-076").choose("soulstrike").canPlay("BP13-081@ex")).toBe(false);
    const mill = d(spec(0)).play("BP13-076").choose("mill");
    expect(mill.cemetery()).toEqual(["BP13-081", "V1", "V2"]);
  });

  it("077 Chris — Fanfare: select an Abysscraft follower (not Chris) that costs 5 or less in the cemetery; with Necrocharge 10, summon it with Ward", () => {
    const t = d({ me: { hand: ["BP13-077"], cemetery: ["BP13-074", "BP13-077", "BP13-085", ...n(7)], playPoints: 4 } }).play("BP13-077");
    expect([t.field(), t.keywords("BP13-074@field")]).toEqual([["BP13-077", "BP13-074"], ["bane", "ward"]]);
    expect(d({ me: { hand: ["BP13-077"], cemetery: ["BP13-074", ...n(8)], playPoints: 4 } }).play("BP13-077").field()).toEqual(["BP13-077"]);
  });

  it("078 / 079 Liberté — Fanfare: bury another follower: Evolve costs 1 less; evolved: 3 damage, or 4 and a draw after a follower went from your field to the cemetery", () => {
    const t = d({ me: { hand: ["BP13-078"], field: ["V1"], evolveDeck: ["BP13-079"], deck: ["V2"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.play("BP13-078").yes().evolve("BP13-078");
    expect([t.cemetery(), t.stats("opp:V5"), t.hand(), t.pp()]).toEqual([["V1"], [5, 1], ["V2"], 0]);
    const plain = d({ me: { field: ["BP13-078"], evolveDeck: ["BP13-079"], deck: ["V2"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP13-078");
    expect([plain.stats("opp:V5"), plain.hand()]).toEqual([[5, 2], []]);
  });

  it("080 Silversteel Blader — Storm; Fanfare: +1/+1 with an evolved follower on your field", () => {
    const t = d({ me: { hand: ["BP13-080"], field: [{ card: "BP13-074", evolvedInto: "BP13-075" }], playPoints: 2 } }).play("BP13-080");
    expect([t.stats("BP13-080"), t.keywords("BP13-080")]).toEqual([[3, 3], ["storm"]]);
    expect(d({ me: { hand: ["BP13-080"], field: ["BP13-074"], playPoints: 2 } }).play("BP13-080").stats("BP13-080")).toEqual([2, 2]);
  });

  it("081 Soulstrike — 4 damage; Necrocharge 20: 4 to its leader", () => {
    const spec = (cards: number): DriveSpec => ({ me: { hand: ["BP13-081"], cemetery: n(cards), playPoints: 2 }, opp: { field: ["V5"] } });
    const t = d(spec(20)).play("BP13-081");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 16]);
    expect(d(spec(19)).play("BP13-081").leader("opp")).toBe(20);
  });

  it("082 / 083 Linkstaff Necromancer — Fanfare: bury the top card; evolved: summon a Departed follower that costs 3 or less from the cemetery", () => {
    expect(d({ me: { hand: ["BP13-082"], deck: ["V1", "V2"], playPoints: 3 } }).play("BP13-082").cemetery()).toEqual(["V1"]);
    const evo = d({ me: { field: ["BP13-082"], evolveDeck: ["BP13-083"], cemetery: ["BP13-080", "BP13-085", "V1"], playPoints: 1 } }).evolve("BP13-082");
    expect([evo.field(), evo.cemetery()]).toEqual([["BP13-082", "BP13-080"], ["BP13-085", "V1"]]);
  });

  it("084 Noble Phantom — Fanfare: draw with a Ghost follower in your EX area", () => {
    expect(d({ me: { hand: ["BP13-084"], ex: [GHOST], deck: ["V1"], playPoints: 1 } }).play("BP13-084").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP13-084"], deck: ["V1"], playPoints: 1 } }).play("BP13-084").hand()).toEqual([]);
  });

  it("085 Bandage Connoisseur — Fanfare and Last Words: 4 to an enemy follower and 1 to its leader", () => {
    const t = d({ me: { hand: ["BP13-085", "QUICK-SAC"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP13-085").pick("opp:V5");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 19]);
    t.play("QUICK-SAC").pick("opp:V3");
    expect([t.field("opp"), t.leader("opp")]).toEqual([["V5"], 18]);
  });

  it("086 Ghastly Banishment — 2 Ghosts into the EX area, 1 less to play this turn", () => {
    const t = d({ me: { hand: ["BP13-086"], playPoints: 1 } }).play("BP13-086");
    expect([t.ex(), t.canPlay(`${GHOST}@ex`)]).toEqual([[GHOST, GHOST], true]);
  });

  it("087 Sanguine Necklace — engage and bury it: 1 to your leader, draw", () => {
    const t = d({ me: { field: ["BP13-087"], deck: ["V1"] } }).activate("BP13-087");
    expect([t.leader(), t.hand(), t.cemetery()]).toEqual([19, ["V1"], ["BP13-087"]]);
  });
});
