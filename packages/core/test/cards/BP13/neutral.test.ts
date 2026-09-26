import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP13 Neutral (105–119, T05). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC destroys
// one of your followers. BP01-154 Flame and Glass is an Archfiend follower; BP08-090 an evolved amulet;
// BP10-004 an advanced follower. Token: BP13-T05 Keenedge Artifact.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const KEENEDGE = "BP13-T05";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP13 Neutral", () => {
  it("105 Sahaquiel & Israfil — Ward; Fanfare: may summon a follower (6 or less) from the hand that returns to the hand at your end phase", () => {
    const t = d({ me: { hand: ["BP13-105", "V5", "BP13-114"], deck: n(3), playPoints: 7 }, opp: { deck: n(3) } });
    t.play("BP13-105").none();
    expect(() => t.pick("BP13-114")).toThrow(/not a candidate/);
    t.pick("V5");
    expect([t.field(), t.keywords("BP13-105")]).toEqual([["BP13-105", "V5"], ["ward"]]);
    t.end().none();
    expect([t.field(), t.hand()]).toEqual([["BP13-105"], ["BP13-114", "V5"]]);
  });

  it("106 Sahaquiel & Israfil (Evolved) — On Evolve: another follower into its owner's EX area; yours comes back engaged", () => {
    const t = d({ me: { field: ["BP13-105", { card: "V3", damage: 2 }], evolveDeck: ["BP13-106"], playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("BP13-105").pick("V3");
    expect([t.field(), t.engaged("V3"), t.stats("V3"), t.ex()]).toEqual([["BP13-105", "V3"], true, [3, 4], []]);
    const opp = d({ me: { field: ["BP13-105"], evolveDeck: ["BP13-106"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP13-105");
    expect([opp.field("opp"), opp.ex("opp")]).toEqual([[], ["V5"]]);
  });

  it("107 Planetary Fracture — banish every card on both fields and EX areas and the top 10 of both decks", () => {
    const t = d({
      me: { hand: ["BP13-107"], field: ["V1"], ex: ["V2"], deck: n(12, "V3"), playPoints: 8 },
      opp: { field: ["V5"], ex: ["V3"], deck: n(11, "V2") },
    }).play("BP13-107");
    expect([t.field(), t.ex(), t.field("opp"), t.ex("opp")]).toEqual([[], [], [], []]);
    expect([t.zone("me", "banished").length, t.zone("me", "deck").length, t.zone("opp", "banished").length, t.zone("opp", "deck").length]).toEqual([12, 2, 12, 1]);
  });

  it("108 Miriam — during your turn, each follower put from your field into the cemetery (Miriam too): 1 to the enemy leader", () => {
    const t = d({ me: { field: ["BP13-108", "V1"], hand: ["QUICK-SAC", "QUICK-SAC"] } }).play("QUICK-SAC").pick("V1");
    expect(t.leader("opp")).toBe(19);
    expect(t.play("QUICK-SAC").leader("opp")).toBe(18);
  });

  it("109 / T05 Miriam (Evolved), Keenedge Artifact — On Evolve: bury another follower to summon a Keenedge Artifact (Rush, Drain)", () => {
    const t = d({ me: { field: ["BP13-108", "V1"], evolveDeck: ["BP13-109"], playPoints: 2 } }).evolve("BP13-108").yes();
    expect([t.field(), t.keywords(KEENEDGE), t.leader("opp")]).toEqual([["BP13-108", KEENEDGE], ["rush", "drain"], 19]);
  });

  it("110 Grimnir — Fanfare: with 3 faceup evolved followers in your evolve deck, 5 to an enemy follower and 3 to its leader", () => {
    const spec = (used: string[]): DriveSpec => ({ me: { hand: ["BP13-110"], faceUpEvolveDeck: used, playPoints: 3 }, opp: { field: ["V5"] } });
    const t = d(spec(["BP13-106", "BP13-109", "BP13-113"])).play("BP13-110");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 17]);
    // An evolved amulet and an advanced follower don't count (rulings).
    const not = d(spec(["BP13-106", "BP13-109", "BP08-090", "BP10-004"])).play("BP13-110");
    expect([not.stats("opp:V5"), not.leader("opp")]).toEqual([[5, 5], 20]);
  });

  it("111 Frostfire — Quick; 3 less with an Archfiend follower; 2 enemy followers: 5 damage to one, engage the other (only with 2 — ruling)", () => {
    const t = d({ me: { hand: ["BP13-111"], playPoints: 4 }, opp: { field: ["V5", "V3"] } });
    expect(t.keywords("BP13-111")).toEqual(["quick"]);
    t.play("BP13-111").pick("opp:V3");
    expect([t.field("opp"), t.engaged("opp:V5")]).toEqual([["V5"], true]);
    expect(d({ me: { hand: ["BP13-111"], playPoints: 4 }, opp: { field: ["V5"] } }).canPlay("BP13-111")).toBe(false);
    expect(d({ me: { hand: ["BP13-111"], field: ["BP01-154"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).canPlay("BP13-111")).toBe(true);
    expect(d({ me: { hand: ["BP13-111"], playPoints: 3 }, opp: { field: ["V5", "V3"] } }).canPlay("BP13-111")).toBe(false);
  });

  it("112 / 113 Managrocer — Fanfare: draw; evolved: damage equal to your hand size", () => {
    expect(d({ me: { hand: ["BP13-112"], deck: ["V1"], playPoints: 4 } }).play("BP13-112").hand()).toEqual(["V1"]);
    const evo = d({ me: { field: ["BP13-112"], evolveDeck: ["BP13-113"], hand: n(3), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP13-112");
    expect(evo.stats("opp:V5")).toEqual([5, 2]);
  });

  it("114 Goddess of Rebirth — Ward; Fanfare: leader +7; from the hand, (4) and discard it: destroy an enemy follower, also at Quick timing", () => {
    expect(d({ me: { hand: ["BP13-114"], playPoints: 10 } }).play("BP13-114").none().leader()).toBe(27);
    const t = d({ me: { hand: ["BP13-114"], playPoints: 4 }, opp: { field: ["V5"] } }).activate("BP13-114");
    expect([t.field("opp"), t.cemetery(), t.pp()]).toEqual([[], ["BP13-114"], 0]);
    // During the opponent's attack.
    const q = d({ me: { hand: ["BP13-114"], deck: n(2), playPoints: 4 }, opp: { field: ["V5"], deck: n(2) } }).end();
    q.attack("opp:V5", "leader").quick("BP13-114");
    expect([q.field("opp"), q.leader()]).toEqual([[], 20]);
  });

  it("115 Dogged Detective — Fanfare: a follower with an evolve ability from the cemetery to the hand; Rush when a follower on your field evolves", () => {
    const t = d({ me: { hand: ["BP13-115"], cemetery: ["BP13-115", "BP13-116", "V1"], playPoints: 3 } }).play("BP13-115");
    expect(t.hand()).toEqual(["BP13-116"]);
    const evo = d({ me: { field: ["BP13-115", "BP13-116"], evolveDeck: ["BP13-117"], playPoints: 1 } });
    expect(evo.keywords("BP13-115")).toEqual([]);
    expect(evo.evolve("BP13-116").flush().keywords("BP13-115")).toEqual(["rush"]);
  });

  it("116 / 117 Armored Goblin — Ward; evolved: it doesn't take the next damage this turn", () => {
    const t = d({ me: { field: ["BP13-116"], evolveDeck: ["BP13-117"], playPoints: 1 }, opp: { field: [{ card: "V5", engaged: true }] } });
    t.evolve("BP13-116").attack("BP13-116", "opp:V5");
    expect([t.stats("BP13-116"), t.stats("opp:V5"), t.keywords("BP13-116")]).toEqual([[3, 3], [5, 2], ["ward"]]);
  });

  it("118 Fallen Harpist — Fanfare: a Neutral spell that costs 1 or less from the deck", () => {
    const t = d({ me: { hand: ["BP13-118"], deck: ["V1", "BP13-107", "BP13-119"], playPoints: 3 } }).play("BP13-118");
    expect(() => t.pick("BP13-107")).toThrow(/not a candidate/);
    expect(t.pick("BP13-119").hand()).toEqual(["BP13-119"]);
  });

  it("119 Retracing the Past — a follower of yours gets \"Last Words: leader +2, draw\" this turn (given twice, twice — ruling)", () => {
    const t = d({ me: { hand: ["BP13-119", "BP13-119", "QUICK-SAC"], field: ["V1"], deck: n(3), playPoints: 2 } });
    t.play("BP13-119").play("BP13-119").play("QUICK-SAC").flush();
    expect([t.leader(), t.hand()]).toEqual([24, ["V1", "V1"]]);
  });
});
