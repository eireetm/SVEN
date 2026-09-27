import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP01 Havencraft (066–078), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot is what serving uses.
// AMULET is a 1-cost amulet; QUICK-SAC (0) destroys a follower of yours. CP01-070 is a 1-cost Umamusume amulet.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("CP01 Havencraft", () => {
  it("066 / 067 Mejiro McQueen — Ward; Fanfare, bury an amulet: 3 damage; evolved: an amulet from the cemetery", () => {
    const t = d({ me: { hand: ["CP01-066"], field: ["AMULET"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP01-066").none().yes().pick("opp:V5");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 2], ["CP01-066"]]);
    expect(d({ me: { field: ["CP01-066"], evolveDeck: ["CP01-067"], cemetery: ["AMULET"], playPoints: 1 } }).evolve("CP01-066").hand()).toEqual(["AMULET"]);
  });

  it("068 Gold Ship — Fanfare: reveal the top card, its cost as damage to the enemy leader and your leader's defense; act (10): +10/+10", () => {
    const t = d({ me: { hand: ["CP01-068"], deck: ["V3"], playPoints: 8 } }).play("CP01-068");
    expect([t.leader("opp"), t.leader(), t.zone("me", "deck")]).toEqual([17, 23, ["V3"]]);
    expect(d({ me: { field: ["CP01-068"], playPoints: 10 } }).activate("CP01-068", 0).stats("CP01-068")).toEqual([18, 18]);
  });

  it("069 Ikuno Dictus — Ward; Fanfare: an amulet or Umamusume card from the top 3", () => {
    const t = d({ me: { hand: ["CP01-069"], deck: ["V1", "AMULET", "V3"], playPoints: 3 } }).play("CP01-069").none().pick("AMULET").order();
    expect(t.hand()).toEqual(["AMULET"]);
  });

  it("070 The Will to Overtake — Fanfare: arrange the top 3; act (2), engage and bury this: draw", () => {
    const t = d({ me: { hand: ["CP01-070"], deck: ["V1", "V3", "V5"], playPoints: 1 } }).play("CP01-070").pick("V5").order("V1", "V3");
    expect(t.zone("me", "deck")).toEqual(["V5", "V1", "V3"]);
    const a = d({ me: { field: ["CP01-070"], deck: ["V1"], playPoints: 2 } }).activate("CP01-070");
    expect([a.hand(), a.field()]).toEqual([["V1"], []]);
  });

  it("071 Meisho Doto — On Race: +1/+1 and a 1-cost amulet from the deck onto the field", () => {
    const t = d({ me: { field: ["CP01-071"], evolveDeck: [CARROT], deck: ["V1", "CP01-070"], playPoints: 1 } }).activate("CP01-071").pick("CP01-070");
    expect([t.stats("CP01-071"), t.field()]).toEqual([[4, 4], ["CP01-071", "CP01-070"]]);
  });

  it("072 Mejiro Ryan — an amulet or Mejiro Family follower of yours leaves the field: Storm", () => {
    const t = d({ me: { field: ["CP01-072", "CP01-070"], deck: ["V1"], playPoints: 2 } }).activate("CP01-070");
    expect(t.keywords("CP01-072")).toEqual(["storm"]);
    expect(d({ me: { field: ["CP01-072", "CP01-075"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("CP01-075").keywords("CP01-072")).toEqual(["storm"]);
    expect(d({ me: { field: ["CP01-072", "V1"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("V1").keywords("CP01-072")).toEqual([]);
  });

  it("073 Fate's Forecast — Fanfare: destroy; act, engage and bury this: may take the top card if it costs 7", () => {
    expect(d({ me: { hand: ["CP01-073"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP01-073").field("opp")).toEqual([]);
    expect(d({ me: { field: ["CP01-073"], deck: ["CP01-078"] } }).activate("CP01-073").pick("CP01-078").hand()).toEqual(["CP01-078"]);
  });

  it("074 Inari One — Fanfare, discard an amulet: +2/+0 and Rush", () => {
    const t = d({ me: { hand: ["CP01-074", "AMULET"], playPoints: 2 } }).play("CP01-074").yes();
    expect([t.stats("CP01-074"), t.keywords("CP01-074")]).toEqual([[4, 3], ["rush"]]);
  });

  it("075 Mejiro Dober — On Race: +1/+1 and leader +2", () => {
    const t = d({ me: { field: ["CP01-075"], evolveDeck: [CARROT], playPoints: 1 } }).activate("CP01-075");
    expect([t.stats("CP01-075"), t.leader()]).toEqual([[3, 3], 22]);
  });

  it("076 Mejiro Ardan — Ward; your main phase without another-named Mejiro Family follower: back to hand", () => {
    const alone = d({ me: { field: ["CP01-076"], deck: ["V1", "V1"] }, opp: { deck: ["V1"] } }).end().none().end();
    expect(alone.hand().includes("CP01-076")).toBe(true);
    const pair = d({ me: { field: ["CP01-076", "CP01-075"], deck: ["V1", "V1"] }, opp: { deck: ["V1"] } }).end().none().end();
    expect(pair.field()).toEqual(["CP01-076", "CP01-075"]);
  });

  it("077 Mejiro Palmer — Fanfare: a Mejiro Family follower from the deck; with Make! Some! NOISE! in the cemetery: +1/+1 and Rush", () => {
    const t = d({ me: { hand: ["CP01-077"], deck: ["V1", "CP01-075"], cemetery: ["CP01-031"], playPoints: 4 } }).play("CP01-077").flush().pick("CP01-075");
    expect([t.hand(), t.stats("CP01-077"), t.keywords("CP01-077")]).toEqual([["CP01-075"], [5, 5], ["rush"]]);
  });

  it("078 T.M. Opera O — Fanfare: banish an enemy follower and draw", () => {
    const t = d({ me: { hand: ["CP01-078"], deck: ["V1"], playPoints: 7 }, opp: { field: ["V5"] } }).play("CP01-078");
    expect([t.zone("opp", "banished"), t.hand()]).toEqual([["V5"], ["V1"]]);
  });
});
