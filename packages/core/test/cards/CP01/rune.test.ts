import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP01 Runecraft (027–039), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot is what serving uses; a
// field card `{ card, racing: 1 }` is already racing. BUFF-SOME (0): up to 2 followers of yours +1/+1 this turn (a spell);
// QUICK-SAC (0) destroys a follower of yours. CP01-034 is a 1-cost Umamusume spell, CP01-031 a 2-cost one.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("CP01 Runecraft", () => {
  it("027 / 028 Agnes Tachyon — whenever you play a spell: -1/-1 to an enemy follower; evolved: a spell from the cemetery", () => {
    expect(d({ me: { field: ["CP01-027"], hand: ["BUFF-SOME"] }, opp: { field: ["V5"] } }).play("BUFF-SOME").none().stats("opp:V5")).toEqual([4, 4]);
    const e = d({ me: { field: ["CP01-027"], evolveDeck: ["CP01-028"], cemetery: ["CP01-034"], playPoints: 1 } }).evolve("CP01-027");
    expect(e.hand()).toEqual(["CP01-034"]);
  });

  it("029 Daiwa Scarlet — the 1st Umamusume spell each turn costs 1 less; the 3rd spell this turn: Storm to it and an Umamusume follower", () => {
    expect(d({ me: { field: ["CP01-029"], hand: ["CP01-034"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("CP01-034")).toBe(true);
    expect(d({ me: { field: ["CP01-029", "CP01-029"], hand: ["CP01-031"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("CP01-031")).toBe(true);
    const t = d({ me: { field: ["CP01-029"], hand: ["BUFF-SOME", "BUFF-SOME", "BUFF-SOME"] } });
    t.play("BUFF-SOME").none().play("BUFF-SOME").none();
    expect(t.keywords("CP01-029")).toEqual([]);
    t.play("BUFF-SOME").none();
    expect(t.keywords("CP01-029")).toEqual(["storm"]);
    const s = d({ me: { hand: ["CP01-029"], deck: ["V1", "CP01-034"], playPoints: 4 } }).play("CP01-029").pick("CP01-034");
    expect(s.hand()).toEqual(["CP01-034"]);
  });

  it("030 Vodka — 2 less with a Daiwa Scarlet; once per turn, a spell: +1/+1 and Rush to your Umamusume followers", () => {
    expect(d({ me: { hand: ["CP01-030"], field: ["CP01-029"], playPoints: 1 } }).canPlay("CP01-030")).toBe(true);
    const t = d({ me: { field: ["CP01-030", "V1"], hand: ["BUFF-SOME", "BUFF-SOME"] } }).play("BUFF-SOME").none();
    expect([t.stats("CP01-030"), t.keywords("CP01-030"), t.stats("V1")]).toEqual([[4, 4], ["rush"], [2, 2]]);
    expect(t.play("BUFF-SOME").none().stats("CP01-030")).toEqual([4, 4]);
  });

  it("031 Make! Some! NOISE! — Quick; 3 damage, 4 with an Umamusume card on your field", () => {
    expect(d({ me: { hand: ["CP01-031"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP01-031").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["CP01-031"], field: ["CP01-032"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP01-031").stats("opp:V5")).toEqual([5, 1]);
  });

  it("032 Zenno Rob Roy — another follower of yours races: a spell or amulet from the top 4", () => {
    const t = d({ me: { field: ["CP01-032", "CP01-033"], evolveDeck: [CARROT], deck: ["V1", "CP01-031", "V3", "V5", "V1"], playPoints: 1 } });
    t.activate("CP01-033").flush();
    t.pick("CP01-031").order();
    expect(t.hand().includes("CP01-031")).toBe(true);
  });

  it("033 Agnes Digital — On Race: draw, then discard", () => {
    const t = d({ me: { field: ["CP01-033"], evolveDeck: [CARROT], hand: ["V3"], deck: ["V1"], playPoints: 1 } }).activate("CP01-033").pick("V3");
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["V3"]]);
  });

  it("034 Lamplit Training of a Witch-to-Be — Quick; 2 damage, 3 with a racing follower on your field", () => {
    expect(d({ me: { hand: ["CP01-034"], field: [{ card: "CP01-033", racing: 1 }], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP01-034").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["CP01-034"], field: ["CP01-033"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP01-034").stats("opp:V5")).toEqual([5, 3]);
  });

  it("035 Admire Vega — act, engage: a 2-cost or less spell from the hand into the EX area, 0 this turn", () => {
    const t = d({ me: { field: ["CP01-035"], hand: ["CP01-031", "V1"], playPoints: 0 }, opp: { field: ["V5"] } }).activate("CP01-035").pick("CP01-031");
    expect([t.ex(), t.canPlay("CP01-031@ex")]).toEqual([["CP01-031"], true]);
  });

  it("036 Kawakami Princess — Fanfare, discard a card: 4 damage", () => {
    const t = d({ me: { hand: ["CP01-036", "V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP01-036").yes();
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 1], ["V1"]]);
  });

  it("037 Nakayama Festa — Fanfare: 5 to each enemy leader and follower, discard your hand", () => {
    const t = d({ me: { hand: ["CP01-037", "V1", "V3"], playPoints: 9 }, opp: { field: ["V5"] } }).play("CP01-037");
    expect([t.field("opp"), t.leader("opp"), t.hand()]).toEqual([[], 15, []]);
  });

  it("038 Tosen Jordan — Last Words: a spell from the cemetery", () => {
    expect(d({ me: { field: ["CP01-038"], hand: ["QUICK-SAC"], cemetery: ["CP01-034"] } }).play("QUICK-SAC").pick("CP01-034").hand()).toEqual(["CP01-034"]);
  });

  it("039 Narita Top Road — On Race: +1/+1, draw 2, discard a card", () => {
    const t = d({ me: { field: ["CP01-039"], evolveDeck: [CARROT], deck: ["V1", "V3"], playPoints: 1 } }).activate("CP01-039").pick("V1");
    expect([t.stats("CP01-039"), t.hand(), t.cemetery()]).toEqual([[4, 4], ["V3"], ["V1"]]);
  });
});
