import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP11 Havencraft (086–102). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET a 1-cost
// amulet; WARD 2c 1/3 with Ward. BP11-019 is a Wasteland follower. Tokens: BP11-T03 Dutiful Steed and
// BP11-T04 Bullet Bike (Wasteland Mounts), BP01-T16 Holy Falcon, BP01-T17 Holy Tiger.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const STEED = "BP11-T03";
const BIKE = "BP11-T04";
const FALCON = "BP01-T16";
const TIGER = "BP01-T17";
const endOpponentTurn = (t: ReturnType<typeof d>) => t.game.act({ type: "mainPhase", action: { type: "endMainPhase" } });

describe("BP11 Havencraft", () => {
  it("086 Selena — Storm; up to a Wasteland card and a follower that costs 2 or less from the top 4 into the EX area; Strike recovers 2 play points", () => {
    const t = d({ me: { hand: ["BP11-086"], deck: ["BP11-019", "V1", "V5", "V3"], playPoints: 4 } }).play("BP11-086").pick("BP11-019").pick("V1").order();
    expect([t.ex(), t.keywords("BP11-086")]).toEqual([["BP11-019", "V1"], ["storm"]]);
    expect(d({ me: { field: ["BP11-086"], playPoints: 0, maxPlayPoints: 5 } }).attack("BP11-086", "opp:leader").pp()).toBe(2);
  });

  it("087 / 088 Anvelt — Ward; up to 2 enemy followers take 3, and the enemy leader 2 with a Wasteland card in the EX area; evolved: the same", () => {
    const t = d({ me: { hand: ["BP11-087"], ex: [STEED], playPoints: 6 }, opp: { field: ["V1", "V3", "V5"] } }).play("BP11-087").none().pick("opp:V1", "opp:V5");
    expect([t.field("opp"), t.stats("opp:V5"), t.leader("opp"), t.keywords("BP11-087")]).toEqual([["V3", "V5"], [5, 2], 18, ["ward"]]);
    const evo = d({ me: { field: ["BP11-087"], evolveDeck: ["BP11-088"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP11-087").pick("opp:V5");
    expect([evo.stats("opp:V5"), evo.leader("opp")]).toEqual([[5, 2], 20]);
  });

  it("089 / 090 Vengeful Sniper — Ward; Fanfare 2 to the enemy leader with 2 amulets on the field and in the EX area; evolved: banishes an enemy follower with 3 defense or less", () => {
    expect(d({ me: { hand: ["BP11-089"], field: ["AMULET"], ex: [STEED], playPoints: 3 } }).play("BP11-089").none().leader("opp")).toBe(18);
    expect(d({ me: { hand: ["BP11-089"], field: ["AMULET"], playPoints: 3 } }).play("BP11-089").none().leader("opp")).toBe(20);
    const evo = d({ me: { field: ["BP11-089"], evolveDeck: ["BP11-090"], playPoints: 1 }, opp: { field: ["V2", "V5"] } }).evolve("BP11-089");
    expect([evo.field("opp"), evo.zone("opp", "banished")]).toEqual([["V5"], ["V2"]]);
  });

  it("091 Paladin of Clemency — Fanfare leader +1, draw and discard; (2): 2 damage and leader +1", () => {
    const t = d({ me: { hand: ["BP11-091", "V3"], deck: ["V1"], playPoints: 2 } }).play("BP11-091").pick("V3");
    expect([t.leader(), t.hand(), t.cemetery()]).toEqual([21, ["V1"], ["V3"]]);
    const act = d({ me: { field: ["BP11-091"], playPoints: 2 }, opp: { field: ["V5"] } }).activate("BP11-091");
    expect([act.stats("opp:V5"), act.leader()]).toEqual([[5, 3], 21]);
  });

  it("092 Holy Sanctuary — engage: an option not chosen this turn; refreshed when your leader gains defense, not in your start phase", () => {
    const t = d({ me: { field: ["BP11-092", "V1"], hand: ["BP11-091", "V3"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } });
    t.activate("BP11-092").choose("damage");
    expect([t.stats("opp:V5"), t.engaged("BP11-092")]).toEqual([[5, 2], true]);
    t.play("BP11-091").pick("V3");
    expect(t.engaged("BP11-092")).toBe(false);
    t.activate("BP11-092");
    expect(t.decision?.type === "choose" && t.decision.options.map((o) => o.id)).toEqual(["buff", "tiger"]);
    t.choose("tiger");
    expect(t.field()).toEqual(["BP11-092", "V1", "BP11-091", TIGER]);
    const start = d({ me: { field: [{ card: "BP11-092", engaged: true }], deck: ["V1", "V1"] }, opp: { deck: ["V1"] } }).end();
    endOpponentTurn(start);
    expect(start.engaged("BP11-092")).toBe(true);
  });

  it("093 / 094 Set — Ward, Bane, Aura; from the hand (1) and discard it: leader +2; evolved: leader +4", () => {
    const t = d({ me: { hand: ["BP11-093"], playPoints: 1 } }).activate("BP11-093");
    expect([t.leader(), t.cemetery()]).toEqual([22, ["BP11-093"]]);
    const evo = d({ me: { field: ["BP11-093"], evolveDeck: ["BP11-094"], playPoints: 1 } }).evolve("BP11-093");
    expect([evo.leader(), evo.keywords("BP11-093")]).toEqual([24, ["ward", "bane", "aura"]]);
  });

  it("095 Shady Priest — a Steed into the EX area; a Mount of yours leaving the field (3): banish an enemy follower", () => {
    expect(d({ me: { hand: ["BP11-095"], playPoints: 1 } }).play("BP11-095").ex()).toEqual([STEED]);
    const t = d({ me: { field: ["BP11-095", STEED], playPoints: 3 }, opp: { field: ["V5"] } }).activate(STEED).yes();
    expect([t.zone("opp", "banished"), t.pp(), t.stats("BP11-095")]).toEqual([["V5"], 0, [3, 2]]);
  });

  it("096 Haven Fire — 1 less with Selena; 4 damage and 1 to its leader with a Wasteland card in the EX area", () => {
    const t = d({ me: { hand: ["BP11-096"], field: ["BP11-086"], ex: [STEED], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP11-096");
    expect([t.stats("opp:V5"), t.leader("opp"), t.pp()]).toEqual([[5, 1], 19, 0]);
    expect(d({ me: { hand: ["BP11-096"], playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP11-096")).toBe(false);
  });

  it("097 / 098 Enchanted Knight — Ward; evolved: draw 2 with 4 Ward followers", () => {
    const t = d({ me: { field: ["BP11-097", "WARD", "WARD", "WARD"], evolveDeck: ["BP11-098"], deck: ["V1", "V3"], playPoints: 1 } }).evolve("BP11-097");
    expect(t.hand()).toEqual(["V1", "V3"]);
    expect(d({ me: { field: ["BP11-097", "WARD", "WARD"], evolveDeck: ["BP11-098"], deck: ["V1"], playPoints: 1 } }).evolve("BP11-097").hand()).toEqual([]);
  });

  it("099 Revolver Eagle — Storm; a Bullet Bike into the EX area; (6): +4/+4", () => {
    const t = d({ me: { hand: ["BP11-099"], playPoints: 8 } }).play("BP11-099");
    expect([t.ex(), t.keywords("BP11-099")]).toEqual([[BIKE], ["storm"]]);
    expect(t.activate("BP11-099").stats("BP11-099")).toEqual([6, 5]);
  });

  it("100 Sacred Stone Apostle — +1/+1 with an amulet; Strike draws and discards", () => {
    expect(d({ me: { hand: ["BP11-100"], field: ["AMULET"], playPoints: 1 } }).play("BP11-100").stats("BP11-100")).toEqual([2, 3]);
    const t = d({ me: { field: ["BP11-100"], hand: ["V3"], deck: ["V1"] } }).attack("BP11-100", "opp:leader").pick("V3");
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["V3"]]);
  });

  it("101 Benevolent Blight — 2 to each enemy follower, leader +2, draw", () => {
    const t = d({ me: { hand: ["BP11-101"], deck: ["V1"], playPoints: 4 }, opp: { field: ["V1", "V5"] } }).play("BP11-101");
    expect([t.field("opp"), t.stats("opp:V5"), t.leader(), t.hand()]).toEqual([["V5"], [5, 3], 22, ["V1"]]);
  });

  it("102 Pure Metamorphosis — destroy a card of yours and summon a Holy Falcon", () => {
    const t = d({ me: { hand: ["BP11-102"], field: ["AMULET"], playPoints: 1 } }).play("BP11-102");
    expect([t.field(), t.cemetery()]).toEqual([[FALCON], ["AMULET", "BP11-102"]]);
    expect(d({ me: { hand: ["BP11-102"], playPoints: 1 } }).canPlay("BP11-102")).toBe(false);
  });
});
