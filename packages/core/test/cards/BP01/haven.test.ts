import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP01 Havencraft (126–150) and tokens T16 Holy Falcon, T17 Holy Tiger.
// BP01-133 Sacred Plea is used as a cheap amulet.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const PLEA = "BP01-133";

describe("BP01 Havencraft", () => {
  it("126 Moon Al-mi'raj — Storm; Follower Strike +2 attack; +2 defense at your end phase", () => {
    const t = d({ me: { hand: ["BP01-126"], playPoints: 5 }, opp: { field: [{ card: "V5", engaged: true }] } });
    t.play("BP01-126").attack("BP01-126", "opp:V5");
    expect(t.field("opp")).toEqual([]); // 4 + 2 = 6 damage
    expect(t.cemetery()).toEqual(["BP01-126"]); // V5 hit back for 5
  });

  it("126 Moon Al-mi'raj — +2 defense at the start of your end phase", () => {
    const t = d({ me: { field: ["BP01-126"] }, opp: { deck: ["V1"] } }).end();
    expect(t.stats("BP01-126")).toEqual([4, 7]);
  });

  it("127 / 128 Jeanne d'Arc — 2 to each enemy follower; evolved: again, and others +2 defense", () => {
    const t = d({ me: { hand: ["BP01-127"], playPoints: 4 }, opp: { field: ["V1", "V5"] } }).play("BP01-127");
    expect(t.field("opp")).toEqual(["V5"]);
    const evo = d({ me: { field: ["BP01-127", "V1"], evolveDeck: ["BP01-128"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP01-127");
    expect([evo.stats("opp:V5"), evo.stats("V1"), evo.stats("BP01-127")]).toEqual([
      [5, 3],
      [2, 4],
      [4, 5],
    ]);
  });

  it("129 / 137 Laelia and Cleric Lancer — combat damage equal to defense; Lancer +4 on the opponent's turn", () => {
    const t = d({ me: { field: ["BP01-129", "V2"] }, opp: { field: [{ card: "V5", engaged: true }] } });
    t.attack("V2", "opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 2]); // V2 (2/3) dealt 3
    const lancer = d({
      turn: 6, // the opponent's turn: they attack my engaged Lancer
      me: { field: ["BP01-129", { card: "BP01-137", engaged: true }] },
      opp: { field: ["BP01-080"] },
    });
    lancer.attack("opp:BP01-080", "BP01-137");
    expect(lancer.stats("opp:BP01-080")).toEqual([10, 3]); // Genesis Dragon 10/12 took 5 + 4
  });

  it("130 Laelia (Evolved) — combat damage equal to defense; +2 defense at the start of your end phase", () => {
    const t = d({ me: { field: [{ card: "BP01-129", evolvedInto: "BP01-130" }, "V2"] }, opp: { field: [{ card: "V5", engaged: true }], deck: ["V1"] } });
    t.attack("V2", "opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 2]); // V2 (2/3) dealt 3
    t.end();
    expect(t.stats("BP01-129@field")).toEqual([0, 8]);
  });

  it("131 Themis's Decree — destroy every follower", () => {
    const t = d({ me: { hand: ["BP01-131"], field: ["V1", PLEA], playPoints: 5 }, opp: { field: ["BP01-138"] } }).play("BP01-131");
    expect([t.field(), t.field("opp")]).toEqual([[PLEA], []]);
  });

  it("132 Chorus of Prayer / 142 Cruel Priestess — amulets costing 5 or less from the cemetery onto the field", () => {
    const t = d({ me: { hand: ["BP01-132"], cemetery: [PLEA, "BP01-150", "BP01-141"], playPoints: 7 } }).play("BP01-132").pick(PLEA, "BP01-150");
    expect(t.field()).toEqual([PLEA, "BP01-150"]);
    expect(t.engaged("BP01-150")).toBe(true); // enters engaged
    const cruel = d({ me: { hand: ["BP01-142"], cemetery: [PLEA], playPoints: 4 } }).play("BP01-142");
    expect(cruel.field()).toEqual(["BP01-142", PLEA]);
  });

  it("133 Sacred Plea — bury it: draw 1, or pay 2 more: draw 2", () => {
    const t = d({ me: { field: [PLEA], deck: ["V1", "V2"], playPoints: 2 } }).activate(PLEA, 1);
    expect([t.hand(), t.pp()]).toEqual([["V1", "V2"], 0]);
  });

  it("134 Temple Defender — takes 1 less damage from everything", () => {
    const t = d({ me: { field: ["V2"], hand: ["BP01-179"], playPoints: 1 }, opp: { field: [{ card: "BP01-134", engaged: true }] } });
    t.attack("V2", "opp:BP01-134");
    expect(t.stats("opp:BP01-134")).toEqual([3, 2]); // combat damage 2 -> 1
    t.play("BP01-179"); // Angelic Snipe: ability damage 2 -> 1
    expect(t.stats("opp:BP01-134")).toEqual([3, 1]);
  });

  it("136 Prism Priestess (Evolved) — search an amulet", () => {
    const t = d({ me: { field: ["BP01-135"], evolveDeck: ["BP01-136"], deck: ["V1", PLEA], playPoints: 2 } }).evolve("BP01-135").pick(PLEA);
    expect(t.hand()).toEqual([PLEA]);
  });

  it("139 Blackened Scripture — banish an enemy follower with 3 or less current defense", () => {
    const t = d({ me: { hand: ["BP01-139"], playPoints: 2 }, opp: { field: ["V5", { card: "V3", damage: 1 }] } }).play("BP01-139");
    expect(t.zone("opp", "banished")).toEqual(["V3"]);
  });

  it("140 Dark Offering — destroy your card, leader +3, draw", () => {
    const t = d({ me: { hand: ["BP01-140"], field: ["V1"], deck: ["V2"], playPoints: 1 } }).play("BP01-140");
    expect([t.field(), t.leader(), t.hand()]).toEqual([[], 23, ["V2"]]);
  });

  it("141 Holy Sentinel — once per your turn, another amulet leaving -> Holy Tiger with Ward", () => {
    const t = d({ me: { field: ["BP01-141", PLEA, PLEA], deck: ["V1", "V2"] } });
    t.activate(PLEA);
    expect(t.field()).toEqual(["BP01-141", PLEA, "BP01-T17"]);
    expect(t.keywords("BP01-T17")).toEqual(["rush", "ward"]);
    t.activate(PLEA);
    expect(t.ids("BP01-T17")).toHaveLength(1);
  });

  it("143 Sister Initiate — leader +2 if you have an amulet", () => {
    const t = d({ me: { hand: ["BP01-143"], field: [PLEA], playPoints: 2 } }).play("BP01-143");
    expect(t.leader()).toBe(22);
  });

  it("144 Mainyu / 138 Shrine Knight Maiden — Aura: enemy cards cannot select them", () => {
    const t = d({ me: { hand: ["KILL"], playPoints: 1 }, opp: { field: ["BP01-144", "V1"] } }).play("KILL");
    expect(t.field("opp")).toEqual(["BP01-144"]); // V1 was the only legal target
  });

  it("147 Curate — leader +5 and draw", () => {
    const t = d({ me: { hand: ["BP01-147"], deck: ["V1"], playPoints: 6 } }).play("BP01-147");
    expect([t.leader(), t.hand()]).toEqual([25, ["V1"]]);
  });

  it("148 Hallowed Dogma — an amulet from the top 5 to hand", () => {
    const t = d({ me: { hand: ["BP01-148"], deck: ["V1", PLEA], playPoints: 1 } }).play("BP01-148").pick(PLEA);
    expect([t.hand(), t.zone("me", "deck")]).toEqual([[PLEA], ["V1"]]);
  });

  it("149 Guardian Sun — fanfare gives Ward; act: +2/+2 to a Ward follower", () => {
    const t = d({ me: { hand: ["BP01-149"], field: ["V1"], playPoints: 3 } }).play("BP01-149");
    expect(t.keywords("V1")).toEqual(["ward"]);
    t.activate("BP01-149");
    expect(t.stats("V1")).toEqual([4, 4]);
  });

  it("150 Death Sentence — enters engaged; later: bury it to destroy an enemy follower", () => {
    const t = d({ me: { hand: ["BP01-150"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP01-150");
    expect([t.engaged("BP01-150"), t.canActivate("BP01-150")]).toEqual([true, false]);
    const later = d({ me: { field: ["BP01-150"] }, opp: { field: ["V5"] } }).activate("BP01-150");
    expect(later.field("opp")).toEqual([]);
  });
});
