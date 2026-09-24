import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP02 Swordcraft (018–034) and its tokens Shield Guardian (T02), Leonidas's Resolve (T03).
// "V1".."V5" are vanilla test followers (cost N, V1 = 2/2, V2 = 2/3, V3 = 3/4, V5 = 5/5).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP02 Swordcraft", () => {
  it("018 / 019 Albert — Storm; evolved: no combat damage this turn, Strike refreshes it once per turn", () => {
    expect(d({ me: { hand: ["BP02-018"], playPoints: 4 } }).play("BP02-018").attackTargets("BP02-018")).toEqual(["opp:leader"]);
    const t = d({
      me: { field: ["BP02-018"], evolveDeck: ["BP02-019"], playPoints: 3 },
      opp: { field: [{ card: "V5", engaged: true }, { card: "V3", engaged: true }] },
    });
    t.evolve("BP02-018").attack("BP02-018", "opp:V5");
    expect([t.stats("BP02-018@field"), t.engaged("BP02-018@field"), t.stats("opp:V5")]).toEqual([[3, 5], false, [5, 2]]);
    t.attack("BP02-018", "opp:V3"); // no second refresh this turn
    expect([t.stats("BP02-018@field"), t.engaged("BP02-018@field"), t.stats("opp:V3")]).toEqual([[3, 5], true, [3, 1]]);
  });

  it("020 Alexander — Rush and Assail; refreshed after dealing combat damage on your turn, not after hitting a leader", () => {
    const t = d({ me: { field: ["BP02-020"] }, opp: { field: ["V2"] } }).attack("BP02-020", "opp:V2");
    expect([t.field("opp"), t.engaged("BP02-020")]).toEqual([[], false]);
    const leader = d({ me: { field: ["BP02-020"] } }).attack("BP02-020", "opp:leader");
    expect([leader.leader("opp"), leader.engaged("BP02-020")]).toEqual([15, true]);
  });

  it("021 Amelia — choose: put a follower costing 3 or less from your hand onto the field, or deal 4", () => {
    const t = d({ me: { hand: ["BP02-021", "V3", "V5"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP02-021").choose("1").pick("V3");
    expect([t.field(), t.hand()]).toEqual([["BP02-021", "V3"], ["V5"]]);
    const dmg = d({ me: { hand: ["BP02-021", "V5"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP02-021").choose("2");
    expect(dmg.stats("opp:V5")).toEqual([5, 1]);
    // (1) selects in the hand (non-public, CR 4.1.2.2): always available, may put nothing; (2) needs a target.
    const noTarget = d({ me: { hand: ["BP02-021", "V5"], playPoints: 4 } }).play("BP02-021");
    expect([noTarget.field(), noTarget.hand()]).toEqual([["BP02-021"], ["V5"]]);
  });

  it("023 Leonidas (Evolved) — 5 damage to an enemy follower and itself; Last Words: Leonidas's Resolve buffs Swordcraft followers", () => {
    const t = d({ me: { field: ["BP02-022"], evolveDeck: ["BP02-023"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    t.evolve("BP02-022").pick("opp:V5");
    expect([t.field("opp"), t.stats("BP02-022@field")]).toEqual([["V3"], [6, 2]]);
    const lw = d({
      me: { field: [{ card: "BP02-022", evolvedInto: "BP02-023", damage: 5 }], hand: ["BP02-029"], playPoints: 2 },
      opp: { field: [{ card: "V5", engaged: true }] },
    });
    lw.attack("BP02-022", "opp:V5").play("BP02-029");
    expect([lw.field(), lw.stats("BP02-029"), lw.keywords("BP02-029")]).toEqual([["BP02-T03", "BP02-029"], [5, 5], ["rush"]]);
  });

  it("024 White Paladin — Ward; act 2 + engage: 2 Shield Guardians (Ward)", () => {
    const t = d({ me: { field: ["BP02-024"], playPoints: 2 } }).activate("BP02-024").none();
    expect([t.field(), t.keywords("BP02-T02"), t.pp()]).toEqual([["BP02-024", "BP02-T02", "BP02-T02"], ["ward"], 0]);
  });

  it("026 Jeno (Evolved) — Assail; may take a Levin follower with another name from the top 4", () => {
    const t = d({ me: { field: ["BP02-025"], evolveDeck: ["BP02-026"], deck: ["BP02-025", "BP02-027", "V1", "V2", "V3"], playPoints: 1 } });
    t.evolve("BP02-025").pick("BP02-027").order();
    expect([t.hand(), t.zone("me", "deck"), t.keywords("BP02-025@field")]).toEqual([["BP02-027"], ["V3", "BP02-025", "V1", "V2"], ["assail"]]);
  });

  it("027 Yurius — Quick act: engage to deal 1, also in the opponent's attack", () => {
    const t = d({ me: { field: ["BP02-027"] }, opp: { field: ["V3"] } }).activate("BP02-027");
    expect(t.stats("opp:V3")).toEqual([3, 3]);
    const quick = d({ turn: 6, me: { field: ["BP02-027", { card: "V5", engaged: true }] }, opp: { field: ["V1", "V3"] } });
    quick.attack("opp:V1", "V5").quick("BP02-027").pick("opp:V3");
    expect([quick.stats("opp:V3"), quick.engaged("BP02-027")]).toEqual([[3, 3], true]);
  });

  it("028 Whole-Souled Swing — Quick; 3 damage and a Knight into your EX area", () => {
    const t = d({ me: { hand: ["BP02-028"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP02-028");
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 2], ["BP01-T05"]]);
  });

  it("029 Swift Infiltrator — +1/+1 whenever a follower on your field evolves", () => {
    const t = d({ me: { field: ["BP02-029", "EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2 } }).evolve("EVOLVER");
    expect(t.stats("BP02-029")).toEqual([3, 3]);
  });

  it("030 Samurai — act 3: gains Storm and Bane", () => {
    const t = d({ me: { field: [{ card: "BP02-030", enteredThisTurn: true }], playPoints: 3 } }).activate("BP02-030");
    expect([t.keywords("BP02-030"), t.attackTargets("BP02-030")]).toEqual([["storm", "bane"], ["opp:leader"]]);
  });

  it("032 Avant Blader (Evolved) — search up to 2 Officer followers", () => {
    const t = d({ me: { field: ["BP02-031"], evolveDeck: ["BP02-032"], deck: ["BP02-029", "V1", "BP02-033"], playPoints: 1 } });
    t.evolve("BP02-031").pick("BP02-029", "BP02-033");
    expect(t.hand()).toEqual(["BP02-029", "BP02-033"]);
  });

  it("033 Flame Soldier — 1 damage, or 4 once one of your followers has been destroyed this turn", () => {
    expect(d({ me: { hand: ["BP02-033"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP02-033").stats("opp:V5")).toEqual([5, 4]);
    const t = d({ me: { field: ["V1"], hand: ["BP02-033"], playPoints: 3 }, opp: { field: [{ card: "V5", engaged: true }] } });
    t.attack("V1", "opp:V5").play("BP02-033");
    expect(t.field("opp")).toEqual([]); // 2 from V1's attack, then 4
  });

  it("034 Gunner Maid Seria — search a Princess follower", () => {
    const t = d({ me: { hand: ["BP02-034"], deck: ["V1", "BP02-069"], playPoints: 2 } }).play("BP02-034").pick("BP02-069");
    expect(t.hand()).toEqual(["BP02-069"]);
  });
});
