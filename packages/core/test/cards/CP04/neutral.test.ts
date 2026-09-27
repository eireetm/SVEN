import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP04 Neutral (109–119), Princess Connect! Re: Dive. Both decks are based on the universe (CR 14.5.1.2). V1 is 1c 2/2, V3 3c 3/4,
// V5 5c 5/5 (Neutral). CP04-105 Suzume (2c; UB Fanfare: leader +2) executes a Union Burst ability. CP04-001 Kokkoro is a 1-cost
// PriConne follower; CP04-075 Ranpha a 4-cost one; CP04-065 Lind a 2-cost Geo Theogonia follower. QUICK-SAC destroys a follower of
// yours. (CP04-114 Ameth's second option is tested with CR 14.5.1.4 in test/engine/universes.test.ts.)
const E = cardEngine();
const PC = { universe: "princessConnect" as const };
const d = (spec: DriveSpec) => drive(E, { ...spec, me: { ...PC, ...spec.me }, opp: { ...PC, ...spec.opp } });

describe("CP04 Neutral", () => {
  it("109 / 110 Omniscient Kaiser — Fanfare, discard 2 PriConne cards: draw 2, each opponent discards 2; evolved UB: 7 damage to each enemy follower", () => {
    const t = d({ me: { hand: ["CP04-109", "CP04-001", "CP04-105"], deck: ["V1", "V3"], playPoints: 7 }, opp: { hand: ["V1", "V3", "V5"] } });
    t.play("CP04-109").yes().pick("opp:V1", "opp:V3");
    expect([t.hand().sort(), t.hand("opp"), t.cemetery().sort()]).toEqual([["V1", "V3"], ["V5"], ["CP04-001", "CP04-105"]]);
    expect(d({ me: { field: ["CP04-109"], evolveDeck: ["CP04-110"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("CP04-109").field("opp")).toEqual([]);
  });

  it("111 Misora — UB Fanfare: 8 damage divided between any number of enemy followers; Last Words: a 4-cost PriConne follower into the EX area", () => {
    const t = d({ me: { hand: ["CP04-111"], playPoints: 6 }, opp: { field: ["V5", "V1"] } }).play("CP04-111").pick("opp:V5", "opp:V1").choose("5");
    expect(t.field("opp")).toEqual([]);
    const l = d({ me: { field: ["CP04-111", "V1"], hand: ["QUICK-SAC"], deck: ["CP04-075"] } }).play("QUICK-SAC").pick("CP04-111").pick("CP04-075");
    expect(l.ex()).toEqual(["CP04-075"]);
  });

  it("112 Lyrael — UB Fanfare: up to 3 followers with different names costing 2 or less from the cemetery; another's UB: that follower +1/+1", () => {
    const t = d({ me: { hand: ["CP04-112"], cemetery: ["V1", "V1", "CP04-105"], playPoints: 7 } }).play("CP04-112").pick("V1").pick("CP04-105").flush();
    expect([t.field(), t.stats("CP04-105"), t.leader(), t.cemetery()]).toEqual([["CP04-112", "V1", "CP04-105"], [3, 4], 22, ["V1"]]);
  });

  it("113 / 114 Ameth — Fanfare: may take the top card if it's a PriConne card; evolved UB (1): another follower gets Ward", () => {
    expect(d({ me: { hand: ["CP04-113"], deck: ["CP04-001"], playPoints: 2 } }).play("CP04-113").pick("CP04-001").hand()).toEqual(["CP04-001"]);
    expect(d({ me: { field: ["CP04-113", "V1"], evolveDeck: ["CP04-114"], playPoints: 1 } }).evolve("CP04-113").keywords("V1")).toEqual(["ward"]);
  });

  it("115 Croce — UB Fanfare: battery counters equal to your max play points, at most 7; act (X), remove X: a Geo Theogonia follower costing X or less", () => {
    expect(d({ me: { hand: ["CP04-115"], playPoints: 1, maxPlayPoints: 10 } }).play("CP04-115").counters("CP04-115", "battery")).toBe(7);
    const t = d({ me: { field: [{ card: "CP04-115", counters: { battery: 3 } }], deck: ["CP04-065"], playPoints: 3 } }).activate("CP04-115").choose("2").pick("CP04-065");
    expect([t.field(), t.counters("CP04-115", "battery"), t.pp()]).toEqual([["CP04-115", "CP04-065"], 1, 1]);
  });

  it("116 / 117 Kasumi — Fanfare, a PriConne card from the hand into the EX area: arrange the top 2; evolved UB: engage, no refresh next start phase", () => {
    const t = d({ me: { hand: ["CP04-116", "CP04-001"], deck: ["V1", "V3", "V5"], playPoints: 2 } }).play("CP04-116").yes().pick("V3");
    expect([t.ex(), t.zone("me", "deck")]).toEqual([["CP04-001"], ["V3", "V5", "V1"]]);
    const e = d({ me: { field: ["CP04-116"], evolveDeck: ["CP04-117"], playPoints: 1 }, opp: { field: ["V5"], deck: ["V1"] } }).evolve("CP04-116");
    expect(e.engaged("opp:V5")).toBe(true);
    expect(e.end().engaged("opp:V5")).toBe(true);
  });

  it("118 Call of the Guild — a PriConne follower from the top 4 into the EX area", () => {
    expect(d({ me: { hand: ["CP04-118"], deck: ["V1", "CP04-001", "V3", "V5"], playPoints: 1 } }).play("CP04-118").pick("CP04-001").order().ex()).toEqual(["CP04-001"]);
  });

  it("119 Ayumi — UB Strike: an enemy follower doesn't refresh during its next start phase", () => {
    const t = d({ me: { field: ["CP04-119"] }, opp: { field: [{ card: "V5", engaged: true }], deck: ["V1"] } }).attack("CP04-119", "opp:leader");
    expect(t.end().engaged("opp:V5")).toBe(true);
  });
});
