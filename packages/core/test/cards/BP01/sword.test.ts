import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP01 Swordcraft (026–050) and tokens T04 Otohime's Bodyguard, T05 Knight, T06 Viking,
// T07 Steelclad Knight. BP01-042 Ninja Trainee is a vanilla Swordcraft 1-cost 2/2.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const GUARD = "BP01-T04";
const NINJA = "BP01-042";

describe("BP01 Swordcraft", () => {
  it("026 / 027 Sea Queen Otohime — fanfare Bodyguard; evolved: 3 more, overflow to EX", () => {
    const t = d({ me: { hand: ["BP01-026"], playPoints: 4 } }).play("BP01-026").none();
    expect(t.field()).toEqual(["BP01-026", GUARD]);
    expect(t.keywords(GUARD)).toContain("ward");
    const evo = d({ me: { field: ["BP01-026", "V1", "V1"], evolveDeck: ["BP01-027"], playPoints: 2 } });
    evo.evolve("BP01-026").none(); // two Bodyguards enter together (one Ward choice); the third goes to EX
    expect(evo.field()).toEqual(["BP01-026", "V1", "V1", GUARD, GUARD]);
    expect(evo.ex()).toEqual([GUARD]);
  });

  it("028 Aurelia — Rush + Assail attack reserved followers at once; 3+ enemy cards: +2/+2 and Aura", () => {
    const t = d({ me: { hand: ["BP01-028"], playPoints: 5 }, opp: { field: ["V1", "V2", "V3"] } });
    t.play("BP01-028").none();
    expect(t.stats("BP01-028")).toEqual([6, 8]);
    expect(t.keywords("BP01-028")).toEqual(["rush", "assail", "ward", "aura"]);
    expect(t.attackTargets("BP01-028")).toEqual(["V1", "V2", "V3"]);
  });

  it("029 / 030 Shadowed Assassin — engage an enemy follower; evolved: destroy an engaged one", () => {
    const t = d({ me: { hand: ["BP01-029"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP01-029");
    expect(t.engaged("opp:V5")).toBe(true);
    const evo = d({ me: { field: ["BP01-029"], evolveDeck: ["BP01-030"], playPoints: 2 }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } });
    evo.evolve("BP01-029");
    expect(evo.field("opp")).toEqual(["V3"]);
  });

  it("031 Frontguard General — Last Words: 2 Steelclad Knights with Ward, engage any of them", () => {
    const t = d({ me: { field: [{ card: "BP01-031", damage: 8 }], hand: ["V1"], playPoints: 1 } });
    t.play("V1").pick("BP01-T07"); // destroyed at Confirmation Timing; engage one knight
    const knights = t.ids("BP01-T07");
    expect(knights.map((k) => t.game.state.cards[k]!.engaged)).toEqual([true, false]);
    expect(knights.every((k) => t.game.reader().hasKeyword(k, "ward"))).toBe(true);
  });

  it("032 Alwida's Command — three tokens; the player picks which fit", () => {
    const t = d({ me: { hand: ["BP01-032"], field: ["V1", "V1", "V1"], playPoints: 5 } });
    t.play("BP01-032").choose("Viking", "Knight");
    expect(t.field()).toEqual(["V1", "V1", "V1", "BP01-T06", "BP01-T05"]);
    expect(t.keywords("BP01-T06")).toEqual(["storm"]);
  });

  it("033 Royal Banner — Swordcraft followers +1/+1 now and whenever one enters", () => {
    const t = d({ me: { hand: ["BP01-033", NINJA], field: [NINJA, "V1"], playPoints: 5 } });
    t.play("BP01-033");
    expect([t.stats(NINJA), t.stats("V1")]).toEqual([
      [3, 3],
      [2, 2],
    ]);
    t.play(`${NINJA}@hand`);
    expect(t.ids(NINJA).map((id) => t.game.reader().info(id).attack)).toEqual([3, 3]);
  });

  it("035 Maid Leader (Evolved) — search a follower with an evolve ability", () => {
    const t = d({ me: { field: ["BP01-034"], evolveDeck: ["BP01-035"], deck: ["V1", "BP01-171"], playPoints: 2 } });
    t.evolve("BP01-034").pick("BP01-171");
    expect(t.hand()).toEqual(["BP01-171"]);
  });

  it("036 Gemstaff Commander / 040 Ninja Master — search by class / trait (may find nothing)", () => {
    const t = d({ me: { hand: ["BP01-036", "BP01-040"], deck: ["V1", NINJA], playPoints: 7 } });
    t.play("BP01-036").pick(NINJA);
    expect(t.hand()).toEqual(["BP01-040", NINJA]);
    t.play("BP01-040"); // no Ninja left: nothing to find, the deck is still shuffled
    expect(t.events.some((e) => e.type === "deckShuffled")).toBe(true);
  });

  it("037 Sage Commander — other followers on your field +1/+1", () => {
    const t = d({ me: { hand: ["BP01-037"], field: ["V1"], playPoints: 5 } }).play("BP01-037");
    expect([t.stats("V1"), t.stats("BP01-037")]).toEqual([
      [3, 3],
      [5, 5],
    ]);
  });

  it("038 Swordsman — fanfare and act engage an enemy follower", () => {
    const t = d({ me: { hand: ["BP01-038"], playPoints: 1 }, opp: { field: ["V1", "V2"] } });
    t.play("BP01-038").pick("opp:V1").activate("BP01-038").pick("opp:V2");
    expect([t.engaged("opp:V1"), t.engaged("opp:V2")]).toEqual([true, true]);
  });

  it("039 Pompous Princess — look at 5, may put a 1-cost follower onto the field, rest to the bottom", () => {
    const t = d({ me: { hand: ["BP01-039"], deck: ["V2", NINJA, "V3", "V5", "V1", "V2"], playPoints: 3 } });
    t.play("BP01-039").pick(NINJA).order("V5", "V1", "V3", "V2");
    expect(t.field()).toEqual(["BP01-039", NINJA]);
    expect(t.zone("me", "deck")).toEqual(["V2", "V5", "V1", "V3", "V2"]);
  });

  it("041 Arthurian Light — Knight with Storm / engage an enemy / draw (each engages it)", () => {
    const t = d({ me: { field: ["BP01-041"], playPoints: 3 } }).activate("BP01-041", 0);
    expect(t.attackTargets("BP01-T05")).toEqual(["opp:leader"]);
    expect(t.canActivate("BP01-041")).toBe(false);
  });

  it("043 / 044 Fervid Soldier — +1 attack whenever another follower enters", () => {
    const t = d({ me: { field: ["BP01-043"], hand: ["V1"], playPoints: 1 } }).play("V1");
    expect(t.stats("BP01-043")).toEqual([3, 2]);
  });

  it("045 Luminous Knight — fanfare +1 attack to another; Last Words +1 attack", () => {
    const t = d({ me: { hand: ["BP01-045"], field: ["V1"], playPoints: 2 } }).play("BP01-045");
    expect(t.stats("V1")).toEqual([3, 2]);
    const lw = d({ me: { field: [{ card: "BP01-045", damage: 1 }, "V2"], hand: ["V1"], playPoints: 1 } });
    lw.play("V1").pick("V2"); // the knight dies at Confirmation Timing; its Last Words picks V2
    expect(lw.stats("V2")).toEqual([3, 3]);
  });

  it("047 Navy Lieutenant — gives another follower Assail", () => {
    const t = d({ me: { hand: ["BP01-047"], field: ["V1"], playPoints: 2 }, opp: { field: ["V2"] } }).play("BP01-047");
    expect(t.attackTargets("V1")).toEqual(["V2", "opp:leader"]);
  });

  it("048 Novice Trooper — Storm: attacks the leader the turn it enters", () => {
    const t = d({ me: { hand: ["BP01-048"], playPoints: 3 } }).play("BP01-048");
    expect(t.attackTargets("BP01-048")).toEqual(["opp:leader"]);
  });

  it("049 Forge Weaponry — +1/+1 and draw; unplayable without a follower", () => {
    const t = d({ me: { hand: ["BP01-049"], field: ["V1"], deck: ["V2"], playPoints: 2 } }).play("BP01-049");
    expect(t.stats("V1")).toEqual([3, 3]);
    expect(t.hand()).toEqual(["V2"]);
    expect(d({ me: { hand: ["BP01-049"], playPoints: 2 } }).canPlay("BP01-049")).toBe(false);
  });

  it("050 Onslaught — 5 damage and a Knight into the EX area", () => {
    const t = d({ me: { hand: ["BP01-050"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP01-050");
    expect(t.field("opp")).toEqual([]);
    expect(t.ex()).toEqual(["BP01-T05"]);
  });
});
