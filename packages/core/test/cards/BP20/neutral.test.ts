import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP20 Neutral (111–120, T11). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Omen followers named in BP20-117: BP20-019
// Octrice (2c), BP20-037 Lishenna (2c), BP20-111 Mjerrabaine (3c). Tokens: BP15-PR18 Ravenous Sweetness (5: 2 to each enemy
// leader, leader +2, draw 2, the opponent discards 2 at random), BP20-T11 Crest: Mjerrabaine. Each player starts with 1 SEP.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const SWEETNESS = "BP15-PR18";

describe("BP20 Neutral", () => {
  it("111 / 112 Mjerrabaine, Great Manifest — Fanfare: discard your hand; evolved: a Crest: Mjerrabaine; end phase with 1 card or less in hand: destroy; super-evolved: destroy and 2 to its leader", () => {
    const t = d({ me: { hand: ["BP20-111", "V1", "V3"], playPoints: 3 } }).play("BP20-111");
    expect([t.hand(), t.cemetery()]).toEqual([[], ["V1", "V3"]]);
    const e = d({ me: { field: ["BP20-111"], evolveDeck: ["BP20-112"], hand: ["V1"], playPoints: 1 }, opp: { field: ["V5"], deck: ["V1"] } }).evolve("BP20-111");
    expect(e.ex()).toEqual(["BP20-T11"]);
    e.end().flush();
    expect(e.field("opp")).toEqual([]);
    const keep = d({ me: { field: [{ card: "BP20-111", evolvedInto: "BP20-112" }], hand: ["V1", "V3"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect(keep.field("opp")).toEqual(["V5"]);
    const s = d({ me: { field: ["BP20-111"], evolveDeck: ["BP20-112"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } }).evolve("BP20-111", { sep: true }).flush();
    expect([s.field("opp"), s.leader("opp")]).toEqual([[], 18]);
  });

  it("113 Gilnelise, Voracity Manifest — Drain; playing Ravenous Sweetness: 5 damage; Fanfare: another follower +3/-3, a Ravenous Sweetness without a SEP", () => {
    const t = d({ me: { hand: ["BP20-113"], field: ["V5"], playPoints: 3, superEvolutionPoints: 0 } }).play("BP20-113");
    expect([t.stats("V5"), t.ex(), t.keywords("BP20-113")]).toEqual([[8, 2], [SWEETNESS], ["drain"]]);
    expect(d({ me: { hand: ["BP20-113"], field: ["V5"], playPoints: 3 } }).play("BP20-113").ex()).toEqual([]);
    const p = d({ me: { field: ["BP20-113"], ex: [SWEETNESS], deck: ["V1", "V3"], playPoints: 5 }, opp: { field: ["V5"], hand: ["V1", "V1"] } }).play(`${SWEETNESS}@ex`).flush();
    expect([p.field("opp"), p.leader("opp")]).toEqual([[], 18]);
  });

  it("114 / 115 Dogged One — Fanfare without a SEP: +1/+1 and Storm; evolved: Rush and Assail to a follower of yours", () => {
    const t = d({ me: { hand: ["BP20-114"], playPoints: 2, superEvolutionPoints: 0 } }).play("BP20-114");
    expect([t.stats("BP20-114"), t.keywords("BP20-114")]).toEqual([[3, 3], ["storm"]]);
    expect(d({ me: { hand: ["BP20-114"], playPoints: 2 } }).play("BP20-114").stats("BP20-114")).toEqual([2, 2]);
    expect(d({ me: { field: ["BP20-114"], evolveDeck: ["BP20-115"], playPoints: 1 } }).evolve("BP20-114").keywords("BP20-114")).toEqual(["rush", "assail"]);
  });

  it("116 Inspirational One — Ward; Fanfare without a SEP: 5 damage and leader +2", () => {
    const t = d({ me: { hand: ["BP20-116"], playPoints: 2, superEvolutionPoints: 0 }, opp: { field: ["V5"] } }).play("BP20-116").none();
    expect([t.field("opp"), t.leader()]).toEqual([[], 22]);
    expect(d({ me: { hand: ["BP20-116"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-116").none().leader()).toBe(20);
  });

  it("117 Tablet of Tribulations — act (9), engage and bury this: up to 10 differently named Manifest-named Omen followers, any number onto the field and into the EX area", () => {
    const t = d({ me: { field: ["BP20-117"], deck: ["BP20-019", "BP20-037", "BP20-111", "V1"], playPoints: 9 } }).activate("BP20-117");
    t.pick("BP20-019").pick("BP20-037").pick("BP20-111");
    t.choose("field").choose("ex").choose("deck").flush();
    expect([t.field().includes("BP20-019"), t.ex(), t.zone("me", "deck").sort()]).toEqual([true, ["BP20-037"], ["BP20-111", "V1"]]);
  });

  it("118 / 119 Apostle of Voracity — Fanfare / evolved: another follower +2/-2", () => {
    expect(d({ me: { hand: ["BP20-118"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP20-118").stats("opp:V5")).toEqual([7, 3]);
    expect(d({ me: { field: ["BP20-118"], evolveDeck: ["BP20-119"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP20-118").stats("opp:V5")).toEqual([7, 3]);
  });

  it("120 Greatness Ascended — discarded with a Mjerrabaine follower on your field: may go into the EX area; 2 less from there; draw 2", () => {
    const t = d({ me: { hand: ["BP20-111", "BP20-120"], deck: ["V1", "V3"], playPoints: 4 } }).play("BP20-111").yes();
    expect([t.ex(), t.canPlay("BP20-120@ex")]).toEqual([["BP20-120"], true]);
    t.play("BP20-120@ex");
    expect(t.hand()).toEqual(["V1", "V3"]);
  });

  it("T11 Crest: Mjerrabaine, Great Manifest — end phase: draw with 1 card or less in your hand", () => {
    expect(d({ me: { ex: ["BP20-T11"], hand: ["V1"], deck: ["V3"] }, opp: { deck: ["V1"] } }).end().hand()).toEqual(["V1", "V3"]);
    expect(d({ me: { ex: ["BP20-T11"], hand: ["V1", "V1"], deck: ["V3"] }, opp: { deck: ["V1"] } }).end().hand()).toEqual(["V1", "V1"]);
  });
});
