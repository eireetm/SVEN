import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP10 Neutral (109–122). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC destroys one of your
// followers. BP01-159 Bellringer Angel is a 1-cost Angel follower (Ward), BP03-119 a Fallen Angel
// follower. Ward followers put onto the field ask whether to enter engaged (answered with none()).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ANGEL = "BP01-159";
const FALLEN = "BP03-119";

describe("BP10 Neutral", () => {
  it("109 XXI. Zelgenea — with no other follower destroys an enemy follower and draws; leader +5 at 10 or less; from the cemetery (10): O Great World into the EX area", () => {
    const t = d({ me: { hand: ["BP10-109"], deck: ["V1"], leaderDefense: 8, playPoints: 5 }, opp: { field: ["V5"] } }).play("BP10-109").flush();
    expect([t.field("opp"), t.hand(), t.leader()]).toEqual([[], ["V1"], 13]);
    // Another follower on your field: neither happens; the leader check is made when it resolves.
    const other = d({ me: { hand: ["BP10-109"], field: ["V1"], deck: ["V1"], leaderDefense: 11, playPoints: 5 }, opp: { field: ["V5"] } }).play("BP10-109").flush();
    expect([other.field("opp"), other.hand(), other.leader()]).toEqual([["V5"], [], 11]);
    const act = d({ me: { cemetery: ["BP10-109"], evolveDeck: ["BP10-110"], playPoints: 10 } }).activate("BP10-109").pick("BP10-110");
    expect([act.ex(), act.zone("me", "banished")]).toEqual([["BP10-110"], ["BP10-109"]]);
  });

  it("110 XXI. Zelgenea, O Great World — advanced; 4 to each enemy leader and follower at your end phase while in the EX area; Fanfare 10 to each", () => {
    const t = d({ me: { ex: ["BP10-110"] }, opp: { field: ["V5", "V3"], deck: ["V1"] } }).end();
    expect([t.leader("opp"), t.field("opp"), t.stats("opp:V5")]).toEqual([16, ["V5"], [5, 1]]);
    const play = d({ me: { ex: ["BP10-110"], playPoints: 10 }, opp: { field: ["V5"] } }).play("BP10-110");
    expect([play.leader("opp"), play.field("opp"), play.field()]).toEqual([10, [], ["BP10-110"]]);
  });

  it("111 / 112 Starbright Deity — Ward; reveal a follower in hand: one with its name into the EX area; evolved: banish a follower from the cemetery: up to 2 with its name", () => {
    const t = d({ me: { hand: ["BP10-111", "V3"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP10-111").none().yes().pick("V3");
    expect([t.ex(), t.hand()]).toEqual([["V3"], ["V3"]]);
    const evo = d({ me: { field: ["BP10-111"], evolveDeck: ["BP10-112"], cemetery: ["V1"], deck: ["V1", "V3", "V1"], playPoints: 3 } });
    evo.evolve("BP10-111").yes().pick("V1", "V1");
    expect([evo.ex(), evo.zone("me", "banished"), evo.zone("me", "deck")]).toEqual([["V1", "V1"], ["V1"], ["V3"]]);
  });

  it("113 Fieran — costs 3 less from the EX area; 4 damage; at your end phase other followers +1 attack", () => {
    expect(d({ me: { hand: ["BP10-113"], playPoints: 1 } }).canPlay("BP10-113")).toBe(false);
    const t = d({ me: { ex: ["BP10-113"], field: ["V1"], playPoints: 1 }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP10-113");
    expect([t.stats("opp:V5"), t.pp()]).toEqual([[5, 1], 0]);
    t.end();
    expect([t.stats("V1"), t.stats("BP10-113")]).toEqual([[3, 2], [2, 2]]);
  });

  it("114 Fallen Shot — an Angel follower from your cemetery and an enemy follower into their owners' EX areas (both needed)", () => {
    const t = d({ me: { hand: ["BP10-114"], cemetery: [ANGEL], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP10-114");
    expect([t.ex(), t.ex("opp"), t.field("opp")]).toEqual([[ANGEL], ["V5"], []]);
    expect(d({ me: { hand: ["BP10-114"], playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP10-114")).toBe(false);
  });

  it("115 / 116 One-Winged Traitor — the top card to the hand if it's an Angel or Fallen Angel; evolved: another such follower +1/+1", () => {
    expect(d({ me: { hand: ["BP10-115"], deck: [ANGEL, "V1"], playPoints: 2 } }).play("BP10-115").pick(ANGEL).hand()).toEqual([ANGEL]);
    const other = d({ me: { hand: ["BP10-115"], deck: ["V1", ANGEL], playPoints: 2 } }).play("BP10-115");
    expect([other.hand(), other.zone("me", "deck")]).toEqual([[], ["V1", ANGEL]]);
    const evo = d({ me: { field: ["BP10-115", ANGEL, "V1"], evolveDeck: ["BP10-116"], playPoints: 1 } }).evolve("BP10-115");
    expect([evo.stats(ANGEL), evo.stats("V1")]).toEqual([[1, 3], [2, 2]]);
  });

  it("117 Mind Splitter — with at least 4 followers on your field the top card goes into the EX area", () => {
    const t = d({ me: { hand: ["BP10-117"], field: ["V1", "V1", "V1"], deck: ["V3"], playPoints: 2 } }).play("BP10-117");
    expect(t.ex()).toEqual(["V3"]);
    expect(d({ me: { hand: ["BP10-117"], field: ["V1", "V1"], deck: ["V3"], playPoints: 2 } }).play("BP10-117").ex()).toEqual([]);
  });

  it("118 Angelic Strike — destroys up to 2 enemy followers; leader +2 with a Fallen Angel card in your cemetery (also selecting none)", () => {
    const t = d({ me: { hand: ["BP10-118"], cemetery: [FALLEN], playPoints: 6 }, opp: { field: ["V5", "V3", "V1"] } }).play("BP10-118").pick("opp:V5", "opp:V3");
    expect([t.field("opp"), t.leader()]).toEqual([["V1"], 22]);
    const plain = d({ me: { hand: ["BP10-118"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP10-118").pick("opp:V5");
    expect([plain.field("opp"), plain.leader()]).toEqual([[], 20]);
    const empty = d({ me: { hand: ["BP10-118"], cemetery: [FALLEN], playPoints: 6 } }).play("BP10-118");
    expect(empty.leader()).toBe(22);
  });

  it("119 / 120 Pureshot Angel — Fanfare 3 damage; evolved: 3 to an enemy follower and its leader", () => {
    expect(d({ me: { hand: ["BP10-119"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP10-119").stats("opp:V5")).toEqual([5, 2]);
    const evo = d({ me: { field: ["BP10-119"], evolveDeck: ["BP10-120"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP10-119");
    expect([evo.stats("opp:V5"), evo.leader("opp")]).toEqual([[5, 2], 17]);
  });

  it("121 Corruption Guardian — Ward; discard an Angel or Fallen Angel card: leader +3, draw, recover 2 play points", () => {
    const t = d({ me: { hand: ["BP10-121", "V1", ANGEL], deck: ["V3"], playPoints: 5 } }).play("BP10-121").none().yes();
    expect([t.leader(), t.hand(), t.cemetery(), t.pp()]).toEqual([23, ["V1", "V3"], [ANGEL], 2]);
  });

  it("122 Winged Courier — Strike: draw a card", () => {
    const t = d({ me: { field: ["BP10-122"], deck: ["V1"] } }).attack("BP10-122", "opp:leader");
    expect([t.hand(), t.leader("opp")]).toEqual([["V1"], 17]);
  });
});
