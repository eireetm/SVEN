import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP18 Neutral (116–126, T10). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). BP18-005 is a Togh Keyoh follower; BP18-123
// A-Class Pyromancy; BP18-117 Saito (a Ward Office card). Token: BP18-T10 Bansai Suzuki, Clone Technique (Ward).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CLONE = "BP18-T10";

describe("BP18 Neutral", () => {
  it("116 Bansai Suzuki, Deacon Shinobi — Rush, Assail, Ward; Fanfare, (2): a Clone; end phase: a Clone; act, discard a Togh Keyoh card: no damage this turn", () => {
    const t = d({ me: { hand: ["BP18-116"], playPoints: 8 } }).play("BP18-116").none().yes().none();
    expect([t.field(), t.keywords("BP18-116")]).toEqual([["BP18-116", CLONE], ["rush", "assail", "ward"]]);
    const act = d({ me: { field: ["BP18-116"], hand: ["BP18-005"] }, opp: { field: [{ card: "V5", engaged: true }] } }).activate("BP18-116");
    expect([act.cemetery(), act.attack("BP18-116", "opp:V5").stats("BP18-116"), act.field("opp")]).toEqual([["BP18-005"], [5, 5], []]);
  });

  it("117 / 118 Saito, Mao Ward Officer — Fanfare: a Togh Keyoh card from the top 3; evolved: an A-Class Pyromancy into the EX area, leader +1 and bury, or banish a card from the hand to draw", () => {
    expect(d({ me: { hand: ["BP18-117"], deck: ["V1", "BP18-005", "V3"], playPoints: 2 } }).play("BP18-117").pick("BP18-005").order().hand()).toEqual(["BP18-005"]);
    const p = d({ me: { field: ["BP18-117"], evolveDeck: ["BP18-118"], cemetery: ["BP18-123"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-117").choose("pyromancy");
    expect([p.ex(), p.pp(), p.canPlay("BP18-123@ex")]).toEqual([["BP18-123"], 0, true]);
    const draw = d({ me: { field: ["BP18-117"], evolveDeck: ["BP18-118"], hand: ["V1"], deck: ["V3"], playPoints: 1 } }).evolve("BP18-117").choose("draw").yes();
    expect([draw.hand(), draw.zone("me", "banished")]).toEqual([["V3"], ["V1"]]);
  });

  it("119 Warped Progress — Quick; additional cost: discard a Togh Keyoh card; 4 damage, leader +1, draw", () => {
    const t = d({ me: { hand: ["BP18-119", "BP18-005"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP18-119");
    expect([t.stats("opp:V5"), t.leader(), t.hand(), t.cemetery()]).toEqual([[5, 1], 21, ["V1"], ["BP18-005", "BP18-119"]]);
    expect(d({ me: { hand: ["BP18-119", "V1"], playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP18-119")).toBe(false);
  });

  it("120 Togh Keyoh, Neometropolis — Fanfare: a Togh Keyoh card from the top 3; act (1), engage and banish it: a Togh Keyoh follower +1/+1, leader +1", () => {
    expect(d({ me: { hand: ["BP18-120"], deck: ["BP18-120", "BP18-005", "V1"], playPoints: 1 } }).play("BP18-120").pick("BP18-005").order().hand()).toEqual(["BP18-005"]);
    const t = d({ me: { field: ["BP18-120", "BP18-005"], playPoints: 1 } }).activate("BP18-120");
    expect([t.stats("BP18-005"), t.leader(), t.zone("me", "banished")]).toEqual([[2, 3], 21, ["BP18-120"]]);
    expect(d({ me: { field: ["BP18-120", "V1"], playPoints: 1 } }).canActivate("BP18-120")).toBe(false);
  });

  it("121 / 122 Stunfist Assassin — Fanfare: 4 damage (the evolved card has no text)", () => {
    expect(d({ me: { hand: ["BP18-121"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP18-121").stats("opp:V5")).toEqual([5, 1]);
  });

  it("123 A-Class Pyromancy — Quick; 2 damage, 1 to its leader with a Saito", () => {
    const t = d({ me: { hand: ["BP18-123"], field: ["BP18-117"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-123");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 19]);
    expect(d({ me: { hand: ["BP18-123"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-123").leader("opp")).toBe(20);
  });

  it("124 / 125 Cyberglasses Criminal — Fanfare: engage an enemy follower (the evolved card has no text)", () => {
    expect(d({ me: { hand: ["BP18-124"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP18-124").engaged("opp:V5")).toBe(true);
  });

  it("126 Third-Class Officer — Fanfare, discard a card: another Ward Office card from the deck", () => {
    const t = d({ me: { hand: ["BP18-126", "V3"], deck: ["BP18-126", "BP18-117", "V1"], playPoints: 1 } }).play("BP18-126").yes().pick("BP18-117");
    expect([t.hand(), t.cemetery()]).toEqual([["BP18-117"], ["V3"]]);
  });

  it("T10 Bansai Suzuki, Clone Technique — Rush, Assail, Ward; end phase: another Clone", () => {
    // The new Clone may enter engaged (CR 12.8.2), then the Ward followers may be engaged at the end phase: not here.
    expect(d({ me: { field: [CLONE] }, opp: { deck: ["V1"] } }).end().none().none().field()).toEqual([CLONE, CLONE]);
  });
});
