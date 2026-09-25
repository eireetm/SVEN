import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP07 Neutral (103–117) and tokens. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; AMULET a 1-cost amulet;
// QUICK-SAC destroys a follower of yours (0). BP07-081 Bone Drone is a 2-cost Machina follower with
// "Last Words: summon an Assembly Droid". Tokens: BP07-T01 Assembly Droid, BP07-T02 Repair Mode,
// BP07-T03 Naterran Great Tree.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const REPAIR = "BP07-T02";
const TREE = "BP07-T03";
const machina = (n: number) => Array<string>(n).fill("BP07-081");

describe("BP07 Neutral", () => {
  it("103 Technolord — banish 3 Machina cards from the cemetery: choose up to 2 (destroy a follower / an amulet, 3 to the leader, a Machina card)", () => {
    const t = d({ me: { hand: ["BP07-103"], cemetery: machina(3), playPoints: 6 }, opp: { field: ["V5", "AMULET"] } });
    t.play("BP07-103").choose("follower", "amulet").yes();
    expect([t.field("opp"), t.zone("me", "banished").length]).toEqual([[], 3]);
    const search = d({ me: { hand: ["BP07-103"], cemetery: machina(3), deck: ["BP07-103", "BP07-081", "V1"], playPoints: 6 } });
    search.play("BP07-103").choose("leader", "search").yes().pick("BP07-081");
    expect([search.leader("opp"), search.hand()]).toEqual([17, ["BP07-081"]]);
    // (3) can be chosen and the cost left unpaid: nothing happens (ruling).
    const unpaid = d({ me: { hand: ["BP07-103"], cemetery: machina(3), playPoints: 6 } }).play("BP07-103").choose("leader").no();
    expect([unpaid.leader("opp"), unpaid.cemetery().length]).toEqual([20, 3]);
  });

  it("104 / 105 Viridia Magna — Rush, Assail, Bane; Last Words, banish a Tree: back onto the field engaged and evolved (Ward), or banished if not", () => {
    const spec = { me: { field: ["BP07-104", TREE], hand: ["QUICK-SAC", "QUICK-SAC"], evolveDeck: ["BP07-105"], deck: ["V1", "V1"] } };
    // The banished Tree then draws and discards (V1).
    const t = d(spec).play("QUICK-SAC").yes().yes().pick("V1");
    expect([t.field(), t.engaged("BP07-104"), t.stats("BP07-104"), t.keywords("BP07-104")]).toEqual([["BP07-104"], true, [4, 4], ["ward"]]);
    t.play("QUICK-SAC"); // evolved: Last Words leader +2
    expect([t.leader(), t.cemetery().includes("BP07-104")]).toEqual([22, true]);
    const declined = d(spec).play("QUICK-SAC").yes().no().pick("V1");
    expect([declined.field(), declined.zone("me", "banished")]).toEqual([[], ["BP07-104"]]);
    expect(d({ me: { field: ["BP07-104"], hand: ["QUICK-SAC"], evolveDeck: ["BP07-105"] } }).play("QUICK-SAC").cemetery()).toEqual([
      "BP07-104",
      "QUICK-SAC",
    ]);
  });

  it("106 Mechawing Angel — Ward; an Assembly Droid or Repair Mode; engage with 5 Machina cards in the cemetery: 4 damage", () => {
    expect(d({ me: { hand: ["BP07-106"] } }).play("BP07-106").none().choose("repair").ex()).toEqual([REPAIR]);
    expect(d({ me: { field: ["BP07-106"], cemetery: machina(4) }, opp: { field: ["V5"] } }).canActivate("BP07-106")).toBe(false);
    expect(d({ me: { field: ["BP07-106"], cemetery: machina(5) }, opp: { field: ["V5"] } }).activate("BP07-106").stats("opp:V5")).toEqual([5, 1]);
  });

  it("107 Desert Pathfinder — may put a Tree; with 5 Natura cards on your field and in your EX area, a Natura card from the top 3", () => {
    const spec = { me: { hand: ["BP07-107"], field: ["BP07-010"], ex: ["BP07-010", "BP07-010"], deck: ["V1", "BP07-013", "V3"] } };
    const t = d(spec).play("BP07-107").choose("field").pick("BP07-013").order();
    expect(t.hand()).toEqual(["BP07-013"]);
    // Without the Tree there are only 4 (ruling).
    expect(d(spec).play("BP07-107").choose("none").hand()).toEqual([]);
  });

  it("108 / 109 Maisha — Strike: play a Neutral spell costing 3 or less from the cemetery for 0; evolved: pay 5, bury the top 5 (as many as there are) and Storm", () => {
    const t = d({ me: { field: ["BP07-108"], cemetery: ["BP07-113", "V1"] }, opp: { field: [{ card: "V5", engaged: true }, "V1"] } });
    t.attack("BP07-108", "opp:V5").pick("opp:V5");
    // Purgation's Blade destroys the attack target; Maisha gets +1 per follower in your cemetery and
    // the attack does not change targets (ruling).
    expect([t.field("opp"), t.stats("BP07-108"), t.leader("opp"), t.cemetery()]).toEqual([["V1"], [3, 3], 20, ["V1", "BP07-113"]]);
    const evo = d({ me: { field: ["BP07-108"], evolveDeck: ["BP07-109"], deck: ["V1", "V1", "V1"], playPoints: 7 } }).evolve("BP07-108").yes();
    expect([evo.cemetery(), evo.keywords("BP07-108"), evo.pp()]).toEqual([["V1", "V1", "V1"], ["storm"], 0]);
  });

  it("110 / 111 Robogoblin — Last Words: a Repair Mode; evolved: an Assembly Droid", () => {
    expect(d({ me: { field: ["BP07-110"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([REPAIR]);
    expect(d({ me: { field: ["BP07-110"], evolveDeck: ["BP07-111"], playPoints: 1 } }).evolve("BP07-110").field()).toEqual(["BP07-110", DROID]);
  });

  it("112 Colorful Cook — may put a Tree, leader +1 either way; Last Words: discard a Natura card to draw", () => {
    const t = d({ me: { hand: ["BP07-112"] } }).play("BP07-112").choose("none");
    expect([t.field(), t.leader()]).toEqual([["BP07-112"], 21]);
    const lw = d({ me: { field: ["BP07-112"], hand: ["QUICK-SAC", "BP07-010"], deck: ["V1"] } }).play("QUICK-SAC").yes();
    expect([lw.hand(), lw.cemetery()]).toEqual([["V1"], ["BP07-112", "QUICK-SAC", "BP07-010"]]);
  });

  it("113 Purgation's Blade — destroy an enemy follower; each Maisha +1/+0 per follower in your cemetery", () => {
    const t = d({ me: { hand: ["BP07-113"], field: ["BP07-108"], cemetery: ["V1", "V3"] }, opp: { field: ["V5"] } }).play("BP07-113");
    expect([t.field("opp"), t.stats("BP07-108")]).toEqual([[], [4, 3]]);
    expect(d({ me: { hand: ["BP07-113"] } }).canPlay("BP07-113")).toBe(false);
  });

  it("114 / 115 Aldis — leader +3; evolved Last Words: 3 to the enemy leader", () => {
    expect(d({ me: { hand: ["BP07-114"], playPoints: 5 } }).play("BP07-114").leader()).toBe(23);
    const evo = d({ me: { field: [{ card: "BP07-114", evolvedInto: "BP07-115" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(evo.leader("opp")).toBe(17);
  });

  it("116 Mechagun Wielder — an Assembly Droid or Repair Mode; Last Words: discard a Machina card to draw", () => {
    expect(d({ me: { hand: ["BP07-116"] } }).play("BP07-116").choose("droid").ex()).toEqual([DROID]);
    const lw = d({ me: { field: ["BP07-116"], hand: ["QUICK-SAC", "BP07-081"], deck: ["V1"] } }).play("QUICK-SAC").yes();
    expect(lw.hand()).toEqual(["V1"]);
  });

  it("117 Extreme Carrot — Rush; Last Words, pay 1 and banish a Tree: summon another from the deck and leader +1 (also when none is found)", () => {
    const t = d({ me: { field: ["BP07-117", TREE], hand: ["QUICK-SAC"], deck: ["V1", "BP07-117"], playPoints: 1 } }).play("QUICK-SAC").yes().pick("BP07-117");
    expect([t.field(), t.leader(), t.pp(), t.cemetery()]).toEqual([["BP07-117"], 21, 0, ["BP07-117", "QUICK-SAC", "V1"]]);
    const none = d({ me: { field: ["BP07-117"], hand: ["QUICK-SAC"], ex: [TREE], deck: ["V1"], playPoints: 1 } }).play("QUICK-SAC").yes();
    expect([none.field(), none.leader(), none.ex()]).toEqual([[], 21, []]);
  });

  it("T01 Assembly Droid — engage and bury 3 Machina followers (itself among them): 5 damage", () => {
    const t = d({ me: { field: [DROID, "BP07-081", "BP07-081", "V1"] }, opp: { field: ["V5"] } }).activate(DROID).flush();
    expect([t.field("opp"), t.field()]).toEqual([[], ["V1", DROID, DROID]]);
  });

  it("T02 Repair Mode — Quick; leader +1", () => {
    expect(d({ me: { ex: [REPAIR] } }).play(REPAIR).leader()).toBe(21);
  });

  it("T03 Naterran Great Tree — leaving the field: draw, then discard; pay 1: bury it", () => {
    const t = d({ me: { field: [TREE], hand: ["V3"], deck: ["V1"] } }).activate(TREE).pick("V3");
    expect([t.field(), t.hand(), t.cemetery(), t.pp()]).toEqual([[], ["V1"], ["V3"], 2]);
  });
});
