import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP15 Neutral (112–126, PR17, PR18). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET is a 1-cost
// amulet; QUICK-SAC (0) destroys one of your followers. BP05-103 is Mjerrabaine, Omen of One; BP14-108 Glistering
// Angel (Angel); BP13-118 Fallen Harpist (Fallen Angel). Evolved followers for the evolve deck: BP15-003, 007, 011,
// 015, 025. Tokens: BP15-PR17 Great Testimony, BP15-PR18 Ravenous Sweetness, BP05-T04 Ancient Artifact.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TESTIMONY = "BP15-PR17";
const SWEETNESS = "BP15-PR18";
const ARTIFACT = "BP05-T04";
const EVOLVED = ["BP15-003", "BP15-007", "BP15-011", "BP15-015", "BP15-025"];
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP15 Neutral", () => {
  it("112 Mjerrabaine, Great One — Fanfare, discard 3: a Great Testimony; act once per turn, banish a Mjerrabaine, Omen of One: 2 to the enemy leader, draw 2", () => {
    const t = d({ me: { hand: ["BP15-112", "V1", "V2", "V3"], playPoints: 3 } }).play("BP15-112").yes();
    expect([t.ex(), t.hand(), t.cemetery()]).toEqual([[TESTIMONY], [], ["V1", "V2", "V3"]]);
    const act = d({ me: { field: ["BP15-112"], cemetery: ["BP05-103", "BP05-103"], deck: ["V1", "V2"] } }).activate("BP15-112").pick("BP05-103");
    expect([act.leader("opp"), act.hand(), act.canActivate("BP15-112")]).toEqual([18, ["V1", "V2"], false]);
  });

  it("113 / 114 Gilnelise, Ravenous Craving — Drain at 10 leader defense or less; evolved: another follower +2/-2, or a Ravenous Sweetness", () => {
    expect(d({ me: { field: ["BP15-113"], leaderDefense: 10 } }).keywords("BP15-113")).toEqual(["drain"]);
    expect(d({ me: { field: ["BP15-113"], leaderDefense: 11 } }).keywords("BP15-113")).toEqual([]);
    const t = d({ me: { field: ["BP15-113"], evolveDeck: ["BP15-114"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP15-113").choose("stats");
    expect(t.stats("opp:V5")).toEqual([7, 3]);
    expect(d({ me: { field: ["BP15-113"], evolveDeck: ["BP15-114"], playPoints: 1 } }).evolve("BP15-113").ex()).toEqual([SWEETNESS]);
  });

  it("115 / 116 Arael — Ward; Fanfare / evolved: +1/+1 to a follower of yours", () => {
    expect(d({ me: { hand: ["BP15-115"], field: ["V1"], playPoints: 2 } }).play("BP15-115").none().pick("V1").stats("V1")).toEqual([3, 3]);
    const evo = d({ me: { field: ["BP15-115"], evolveDeck: ["BP15-116"], playPoints: 1 } }).evolve("BP15-115");
    expect([evo.stats("BP15-115"), evo.keywords("BP15-115")]).toEqual([[2, 3], ["ward"]]);
  });

  it("117 Thunder God of the Tempest — Fanfare, up to 2: destroy an enemy amulet, 3 to each enemy follower, Storm, draw 2", () => {
    const t = d({ me: { hand: ["BP15-117"], playPoints: 7 }, opp: { field: ["AMULET", "V3"] } }).play("BP15-117").choose("amulet", "damage");
    expect(t.field("opp")).toEqual(["V3"]);
    expect(t.stats("opp:V3")).toEqual([3, 1]);
    const other = d({ me: { hand: ["BP15-117"], deck: ["V1", "V2"], playPoints: 7 } }).play("BP15-117").choose("storm", "draw");
    expect([other.keywords("BP15-117"), other.hand()]).toEqual([["storm"], ["V1", "V2"]]);
  });

  it("118 Resolve of the Fallen — 2 damage; 4 with 3 faceup evolved followers; with 5, draw and recover 1", () => {
    const spec = (faceUp: string[]): DriveSpec => ({ me: { hand: ["BP15-118"], faceUpEvolveDeck: faceUp, deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(d(spec([])).play("BP15-118").stats("opp:V5")).toEqual([5, 3]);
    const three = d(spec(EVOLVED.slice(0, 3))).play("BP15-118");
    expect([three.stats("opp:V5"), three.hand(), three.pp()]).toEqual([[5, 1], [], 0]);
    const five = d(spec(EVOLVED)).play("BP15-118");
    expect([five.hand(), five.pp()]).toEqual([["V1"], 1]);
  });

  it("119 / 120 Mechanical Analyzer — evolved: draw 2", () => {
    expect(d({ me: { field: ["BP15-119"], evolveDeck: ["BP15-120"], deck: ["V1", "V2"], playPoints: 1 } }).evolve("BP15-119").hand()).toEqual(["V1", "V2"]);
  });

  it("121 Messenger of the Skies — Fanfare: destroy, and an Angel or Fallen Angel card from the top 4", () => {
    const t = d({ me: { hand: ["BP15-121"], deck: ["V1", "BP13-118", "BP14-108", "V2"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP15-121").pick("BP13-118").order();
    expect([t.field("opp"), t.hand()]).toEqual([[], ["BP13-118"]]);
  });

  it("122 Merciless Voiding — an Ancient Artifact per enemy follower", () => {
    expect(d({ me: { hand: ["BP15-122"], playPoints: 3 }, opp: { field: ["V1", "V2"] } }).play("BP15-122").field()).toEqual([ARTIFACT, ARTIFACT]);
  });

  it("123 / 124 Nomadic Conductor — evolved: draw, then a card from the hand to the bottom of the deck", () => {
    const t = d({ me: { field: ["BP15-123"], evolveDeck: ["BP15-124"], hand: ["V3"], deck: ["V1", "V2"], playPoints: 1 } }).evolve("BP15-123").pick("V3");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["V1"], ["V2", "V3"]]);
  });

  it("125 Mountain Gigas — Rush, Ward; Fanfare: 7 damage", () => {
    const t = d({ me: { hand: ["BP15-125"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP15-125").none();
    expect([t.field("opp"), t.keywords("BP15-125")]).toEqual([[], ["rush", "ward"]]);
  });

  it("126 Fluffy Angel — Fanfare / Last Words: leader +1", () => {
    expect(d({ me: { hand: ["BP15-126"], playPoints: 2 } }).play("BP15-126").leader()).toBe(21);
    expect(d({ me: { field: ["BP15-126"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").leader()).toBe(21);
  });

  it("PR17 Great Testimony — destroy; 2 to its leader with a Mjerrabaine, Great One on your field", () => {
    const t = d({ me: { ex: [TESTIMONY], field: ["BP15-112"] }, opp: { field: ["V5"] } }).play(`${TESTIMONY}@ex`);
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 18]);
    expect(d({ me: { ex: [TESTIMONY] }, opp: { field: ["V5"] } }).play(`${TESTIMONY}@ex`).leader("opp")).toBe(20);
  });

  it("PR18 Ravenous Sweetness — 2 to the enemy leader, leader +2, draw 2, the opponent discards 2 at random", () => {
    const t = d({ me: { ex: [SWEETNESS], deck: ["V1", "V2"], playPoints: 5 }, opp: { hand: n(3) } }).play(`${SWEETNESS}@ex`);
    expect([t.leader("opp"), t.leader(), t.hand(), t.hand("opp").length]).toEqual([18, 22, ["V1", "V2"], 1]);
  });
});
