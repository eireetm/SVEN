import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP16 Abysscraft (075–092, T04, T05). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of
// your followers; EVOLVER evolves into EVOLVER-E. Departed followers: BP16-078, BP16-082, BP16-090. Tokens: BP16-T04
// Mimi, BP16-T05 Coco, BP11-T05 Arcane Personnel Carrier, BP01-T14 Ghost, BP01-T15 Forest Bat.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const MIMI = "BP16-T04";
const COCO = "BP16-T05";
const GHOST = "BP01-T14";
const BAT = "BP01-T15";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP16 Abysscraft", () => {
  it("075 Cerberus, Hellfire Unleashed — Fanfare: Mimi and Coco, Storm with Necrocharge (10); act, engage and bury another follower: 2 damage", () => {
    expect(d({ me: { hand: ["BP16-075"], playPoints: 4 } }).play("BP16-075").field()).toEqual(["BP16-075", MIMI, COCO]);
    const nc = d({ me: { hand: ["BP16-075"], cemetery: n(10), playPoints: 4 } }).play("BP16-075");
    expect([nc.keywords(MIMI), nc.keywords(COCO)]).toEqual([["storm"], ["storm"]]);
    const act = d({ me: { field: ["BP16-075", "V1"] }, opp: { field: ["V5"] } }).activate("BP16-075");
    expect([act.stats("opp:V5"), act.field(), act.engaged("BP16-075")]).toEqual([[5, 3], ["BP16-075"], true]);
  });

  it("076 / 077 Aragavy, Eternal Hunter — Fanfare, leader -2: draw; evolved: 5 damage divided among up to 3, 10 at 10 leader defense or less; super-evolved: Storm", () => {
    const t = d({ me: { hand: ["BP16-076"], deck: ["V1"], playPoints: 5 } }).play("BP16-076").yes();
    expect([t.hand(), t.leader()]).toEqual([["V1"], 18]);
    const five = d({ me: { field: ["BP16-076"], evolveDeck: ["BP16-077"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("BP16-076").pick("opp:V5", "opp:V3").choose("4");
    expect([five.stats("opp:V5"), five.stats("opp:V3")]).toEqual([[5, 1], [3, 3]]);
    const ten = d({ me: { field: ["BP16-076"], evolveDeck: ["BP16-077"], leaderDefense: 10, playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    ten.evolve("BP16-076").pick("opp:V5", "opp:V3").choose("5");
    expect(ten.field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP16-076"], evolveDeck: ["BP16-077"], playPoints: 1, ...SUPER } }).evolve("BP16-076", { sep: true }).flush().keywords("BP16-076")).toEqual(["storm"]);
  });

  it("078 Gold Rush Ghost — Storm; Fanfare: an Arcane Personnel Carrier and leader +1, or bury 2; both from the cemetery; buried at the start of each opponent's end phase", () => {
    const t = d({ me: { hand: ["BP16-078"], playPoints: 2 } }).play("BP16-078").choose("carrier");
    expect([t.field(), t.leader(), t.keywords("BP16-078")]).toEqual([["BP16-078", "BP11-T05"], 21, ["storm"]]);
    const raised = d({ me: { field: ["BP16-079"], evolveDeck: ["BP16-080"], cemetery: ["BP16-078"], deck: ["V1", "V3"], playPoints: 1 } }).evolve("BP16-079");
    raised.pending("BP16-078").choose("carrier", "bury").flush();
    expect([raised.field(), raised.leader(), raised.cemetery()]).toEqual([["BP16-079", "BP16-078", "BP11-T05"], 22, ["V1", "V3"]]);
    const end = d({ me: { field: ["BP16-078"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end().end();
    expect([end.field(), end.cemetery()]).toEqual([[], ["BP16-078"]]);
  });

  it("079 / 080 Mukan, Shadowcrypt Ward — a Departed follower onto your field: leader +1; evolved: a Departed follower (3 or less) from the cemetery; super-evolved: one more, with Assail", () => {
    const t = d({ me: { field: ["BP16-079"], evolveDeck: ["BP16-080"], cemetery: ["BP16-082", "BP16-090"], playPoints: 1, ...SUPER } });
    t.evolve("BP16-079", { sep: true }).pending().pick("BP16-082").flush();
    expect([t.field(), t.keywords("BP16-082"), t.keywords("BP16-090"), t.leader()]).toEqual([["BP16-079", "BP16-082", "BP16-090"], ["bane"], ["assail"], 22]);
  });

  it("081 Balto, Dusk Bounty Hunter — Fanfare, up to 3, each (1): destroy; +2/+2 and Ward; +1/+1, draw 2, discard", () => {
    const t = d({ me: { hand: ["BP16-081"], deck: ["V1", "V3"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("BP16-081").choose("destroy", "ward", "draw").yes().yes().yes().pick("V1");
    expect([t.field("opp"), t.stats("BP16-081"), t.keywords("BP16-081"), t.hand(), t.pp()]).toEqual([[], [5, 5], ["ward"], ["V3"], 0]);
  });

  it("082 Ceres, Blue Rose Maiden — Bane; Storm with Necrocharge (5); damage to the enemy leader on your turn: the opponent discards", () => {
    expect(d({ me: { field: ["BP16-082"], cemetery: n(5) } }).keywords("BP16-082")).toEqual(["bane", "storm"]);
    expect(d({ me: { field: ["BP16-082"], cemetery: n(4) } }).keywords("BP16-082")).toEqual(["bane"]);
    const t = d({ me: { field: ["BP16-082"] }, opp: { hand: ["V1", "V3"] } }).attack("BP16-082", "opp:leader").pick("opp:V3");
    expect([t.hand("opp"), t.leader("opp")]).toEqual([["V1"], 19]);
  });

  it("083 / 084 Orthrus, Hellhound Blader — evolved: an enemy follower, 5 damage with Necrocharge (10); or bury 2", () => {
    const t = d({ me: { field: ["BP16-083"], evolveDeck: ["BP16-084"], cemetery: n(10), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP16-083").choose("damage");
    expect(t.field("opp")).toEqual([]);
    const low = d({ me: { field: ["BP16-083"], evolveDeck: ["BP16-084"], cemetery: n(9), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP16-083").choose("damage");
    expect(low.stats("opp:V5")).toEqual([5, 5]);
    expect(d({ me: { field: ["BP16-083"], evolveDeck: ["BP16-084"], deck: ["V1", "V3"], playPoints: 1 } }).evolve("BP16-083").cemetery()).toEqual(["V1", "V3"]);
  });

  it("085 Yuna, Occult Hunter — Fanfare: 2 Ghosts or 2 Forest Bats into the EX area", () => {
    expect(d({ me: { hand: ["BP16-085"], playPoints: 1 } }).play("BP16-085").choose("Forest Bat").ex()).toEqual([BAT, BAT]);
    expect(d({ me: { hand: ["BP16-085"], playPoints: 1 } }).play("BP16-085").choose("Ghost").ex()).toEqual([GHOST, GHOST]);
  });

  it("086 Soul Predation — destroy an enemy follower and one of yours, draw", () => {
    const t = d({ me: { hand: ["BP16-086"], field: ["V1"], deck: ["V3"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP16-086");
    expect([t.field(), t.field("opp"), t.hand()]).toEqual([[], [], ["V3"]]);
    expect(d({ me: { hand: ["BP16-086"], playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP16-086")).toBe(false);
  });

  it("087 / 088 Vlad, Impaler — Storm; Fanfare: 3 damage to each enemy follower; evolved: Storm, Drain", () => {
    const t = d({ me: { hand: ["BP16-087"], playPoints: 7 }, opp: { field: ["V5", "V1"] } }).play("BP16-087");
    expect([t.field("opp"), t.stats("opp:V5")]).toEqual([["V5"], [5, 2]]);
    expect(d({ me: { field: ["BP16-087"], evolveDeck: ["BP16-088"], playPoints: 1 } }).evolve("BP16-087").keywords("BP16-087")).toEqual(["storm", "drain"]);
  });

  it("089 Aryll, Moonstruck Vampire — Fanfare: 2 Forest Bats; act, engage: +1/+1, Rush and Drain to a Vampire token follower", () => {
    expect(d({ me: { hand: ["BP16-089"], playPoints: 4 } }).play("BP16-089").field()).toEqual(["BP16-089", BAT, BAT]);
    const t = d({ me: { field: ["BP16-089", BAT] } }).activate("BP16-089");
    expect([t.stats(BAT), t.keywords(BAT)]).toEqual([[2, 2], ["rush", "drain"]]);
  });

  it("090 Mino, Shrewd Reaper — act, engage, with 10 cards in the cemetery: 3 damage", () => {
    expect(d({ me: { field: ["BP16-090"], cemetery: n(10) }, opp: { field: ["V5"] } }).activate("BP16-090").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { field: ["BP16-090"], cemetery: n(9) }, opp: { field: ["V5"] } }).canActivate("BP16-090")).toBe(false);
  });

  it("091 Beryl, Nightmare Incarnate — Fanfare: 3 to your leader; Strike: leader +5", () => {
    expect(d({ me: { hand: ["BP16-091"], playPoints: 4 } }).play("BP16-091").leader()).toBe(17);
    expect(d({ me: { field: ["BP16-091"] } }).attack("BP16-091", "opp:leader").leader()).toBe(25);
  });

  it("092 Shadowcrypt Memorial — Fanfare: bury the top card; act, engage and bury it, after an evolution this turn: a Ghost", () => {
    expect(d({ me: { hand: ["BP16-092"], deck: ["V1"], playPoints: 1 } }).play("BP16-092").cemetery()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP16-092"] } }).canActivate("BP16-092")).toBe(false);
    const t = d({ me: { field: ["BP16-092", "EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2 } }).evolve("EVOLVER").activate("BP16-092");
    expect(t.field()).toEqual(["EVOLVER", GHOST]);
  });

  it("T04 Mimi, Right Paw Hellhound / T05 Coco, Left Paw Hellhound — Last Words: 2 damage and bury a card / leader +2 and bury a card", () => {
    const mimi = d({ me: { field: [MIMI], hand: ["QUICK-SAC"], deck: ["V1"] }, opp: { field: ["V5"] } }).play("QUICK-SAC");
    expect([mimi.stats("opp:V5"), mimi.cemetery()]).toEqual([[5, 3], ["QUICK-SAC", "V1"]]);
    const coco = d({ me: { field: [COCO], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC");
    expect([coco.leader(), coco.cemetery()]).toEqual([22, ["QUICK-SAC", "V1"]]);
  });
});
