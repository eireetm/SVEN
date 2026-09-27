import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP03 Havencraft (104–124) and Neutral (125, 127), Cardfight!! Vanguard (Oracle Think Tank). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5
// (Neutral). CP03-127 is a Drive Point. Oracle Think Tank followers: CP03-113 Wiseman (2c 2/3), CP03-115 Crescent Moon Tsukuyomi
// (1c). Heal Triggers: CP03-121 Lozenge Magus, CP03-038 Elaine. CP03-086 Blaster Dark has Single Drive. `universe: "vanguard"`
// makes drive checks resolve Triggers.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const DP = "CP03-127";
const VG = "vanguard" as const;

describe("CP03 Havencraft and Neutral", () => {
  it("104 Goddess of the Full Moon, Tsukuyomi — Ward, Twin Drive; Storm with Half and Crescent Moon in the cemetery; Fanfare: may summon an Oracle Think Tank follower costing 4 or less", () => {
    expect(d({ me: { field: ["CP03-104"], cemetery: ["CP03-105", "CP03-115"] } }).keywords("CP03-104")).toEqual(["ward", "twinDrive", "storm"]);
    expect(d({ me: { field: ["CP03-104"], cemetery: ["CP03-105"] } }).keywords("CP03-104")).toEqual(["ward", "twinDrive"]);
    expect(d({ me: { hand: ["CP03-104", "CP03-113"], playPoints: 5 } }).play("CP03-104").none().pick("CP03-113").field()).toEqual(["CP03-104", "CP03-113"]);
  });

  it("105 Goddess of the Half Moon, Tsukuyomi — Fanfare: arrange the top 3; act (1), engage: the revealed top card's cost as damage, a Full Moon to the hand", () => {
    const t = d({ me: { hand: ["CP03-105"], deck: ["V1", "V3", "V5"], playPoints: 2 } }).play("CP03-105").pick("V5").order();
    expect(t.zone("me", "deck")[0]).toBe("V5");
    const a = d({ me: { field: ["CP03-105"], deck: ["CP03-104", "V1"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-105");
    expect([a.field("opp"), a.hand()]).toEqual([[], ["CP03-104"]]);
  });

  it("106 / 107 CEO Amaterasu — Assail, Twin Drive; evolved: a resolved Trigger of your drive check: banish an enemy follower, or draw", () => {
    const t = d({ me: { universe: VG, field: [{ card: "CP03-106", evolvedInto: "CP03-107" }], deck: ["CP03-121", "V1", "V3"], leaderDefense: 10 }, opp: { field: ["V5"] } });
    t.attack("CP03-106", "opp:leader").yes().choose("1");
    expect([t.zone("opp", "banished"), t.leader(), t.leader("opp")]).toEqual([["V5"], 13, 14]);
    expect(d({ me: { hand: ["CP03-106"], deck: ["V1", "V3"], playPoints: 4 } }).play("CP03-106").keywords("CP03-106")).toEqual(["assail", "twinDrive"]);
  });

  it("108 / 109 Silent Tom — Fanfare: a card from the cemetery 3rd from the top; evolved, discard an Oracle Think Tank card: banish a follower with 5 defense or less", () => {
    const t = d({ me: { hand: ["CP03-108"], cemetery: ["V5"], deck: ["V1", "V1", "V1"], playPoints: 3 } }).play("CP03-108").pick("V5");
    expect(t.zone("me", "deck")).toEqual(["V1", "V1", "V5", "V1"]);
    const e = d({ me: { field: ["CP03-108"], evolveDeck: ["CP03-109"], hand: ["CP03-113"], playPoints: 1 }, opp: { field: ["V5", "V1"] } }).evolve("CP03-108").yes();
    e.pick("opp:V5");
    expect([e.zone("opp", "banished"), e.cemetery()]).toEqual([["V5"], ["CP03-113"]]);
  });

  it("110 Evil-Eye Princess, Euryale — Rush, Twin Drive; once on your turn, a resolved Trigger: draw", () => {
    const t = d({ me: { universe: VG, field: ["CP03-110"], deck: ["CP03-121", "CP03-038", "V1", "V1"], leaderDefense: 10 } }).attack("CP03-110", "opp:leader");
    t.yes().yes();
    expect([t.leader(), t.hand().length]).toEqual([16, 1]);
  });

  it("111 Maiden of Libra — Ward; Fanfare: arrange the top 5; act, engage: draw", () => {
    const t = d({ me: { hand: ["CP03-111"], deck: ["V1", "V3"], playPoints: 3 } }).play("CP03-111").none().pick("V3");
    expect(t.zone("me", "deck")).toEqual(["V3", "V1"]);
    expect(d({ me: { field: ["CP03-111"], deck: ["V1"] } }).activate("CP03-111").hand()).toEqual(["V1"]);
  });

  it("112 Battle Sister, Cocoa — Ride (1): +1/+1, arrange the top 5; a resolved Trigger of your drive check: 4 damage and leader +2", () => {
    expect(d({ me: { field: ["CP03-112"], evolveDeck: [DP], playPoints: 1 } }).activate("CP03-112").stats("CP03-112")).toEqual([4, 4]);
    const t = d({ me: { universe: VG, field: ["CP03-112", "CP03-086"], deck: ["CP03-038"], leaderDefense: 10 }, opp: { field: ["V5"] } });
    t.attack("CP03-086", "opp:leader").yes();
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 1], 15]);
  });

  it("113 Oracle Guardian, Wiseman — Fanfare: a cemetery card 3rd from the top; once on your turn, a resolved Trigger: 2 to the enemy leader, leader +2", () => {
    const t = d({ me: { universe: VG, field: ["CP03-113", "CP03-086"], deck: ["CP03-038"], leaderDefense: 10 } }).attack("CP03-086", "opp:leader").yes();
    expect([t.leader(), t.leader("opp")]).toEqual([15, 15]);
    expect(d({ me: { hand: ["CP03-113"], cemetery: ["V5"], deck: ["V1"], playPoints: 2 } }).play("CP03-113").pick("V5").zone("me", "deck")).toEqual(["V1", "V5"]);
  });

  it("114 White Hare of Inaba — Ride (1): +1/+1, leader +1; Fanfare: a cemetery card 3rd from the top", () => {
    const t = d({ me: { field: ["CP03-114"], evolveDeck: [DP], playPoints: 1 } }).activate("CP03-114");
    expect([t.stats("CP03-114"), t.leader()]).toEqual([[2, 2], 21]);
    expect(d({ me: { hand: ["CP03-114"], cemetery: ["V5"], deck: ["V1", "V1", "V1"], playPoints: 1 } }).play("CP03-114").pick("V5").zone("me", "deck")).toEqual([
      "V1",
      "V1",
      "V5",
      "V1",
    ]);
  });

  it("115 Goddess of the Crescent Moon, Tsukuyomi — Fanfare: arrange the top 3; act, engage: reveal the top card, a Half Moon to the hand", () => {
    expect(d({ me: { field: ["CP03-115"], deck: ["CP03-105", "V1"] } }).activate("CP03-115").hand()).toEqual(["CP03-105"]);
    expect(d({ me: { field: ["CP03-115"], deck: ["V1", "CP03-105"] } }).activate("CP03-115").hand()).toEqual([]);
    expect(d({ me: { hand: ["CP03-115"], deck: ["V1", "V3"], playPoints: 1 } }).play("CP03-115").none().order().zone("me", "deck")).toEqual(["V1", "V3"]);
  });

  it("116 Dark Cat — Ride (1): +1/+1; an Oracle Think Tank follower from the top 3 to the hand, the others arranged", () => {
    const t = d({ me: { field: ["CP03-116"], evolveDeck: [DP], deck: ["V1", "CP03-113", "V3"], playPoints: 1 } }).activate("CP03-116").pick("CP03-113");
    t.pick("V1");
    expect([t.hand(), t.zone("me", "deck"), t.stats("CP03-116")]).toEqual([["CP03-113"], ["V1", "V3"], [3, 3]]);
  });

  it("117 Battle Sister, Chocolat — Quick; 2 damage, or discard an Oracle Think Tank card: 3 damage and arrange the top 2", () => {
    const t = d({ me: { hand: ["CP03-117", "CP03-113"], deck: ["V1", "V3"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP03-117").choose("2").yes().pick("V3");
    expect([t.stats("opp:V5"), t.zone("me", "deck"), t.cemetery().sort()]).toEqual([[5, 2], ["V3", "V1"], ["CP03-113", "CP03-117"]]);
  });

  it("118 Oracle Guardian, Nike — Rush, Assail; a resolved Trigger: Storm", () => {
    const t = d({ me: { universe: VG, field: ["CP03-118", "CP03-086"], deck: ["CP03-038"], leaderDefense: 10 } }).attack("CP03-086", "opp:leader").yes();
    expect(t.keywords("CP03-118")).toEqual(["rush", "assail", "storm"]);
    const no = d({ me: { universe: VG, field: ["CP03-118", "CP03-086"], deck: ["CP03-038"], leaderDefense: 10 } }).attack("CP03-086", "opp:leader").no();
    expect(no.keywords("CP03-118")).toEqual(["rush", "assail"]);
  });

  it("119 Dream Eater — Fanfare: draw, then put a card from your hand 3rd from the top", () => {
    const t = d({ me: { hand: ["CP03-119", "V5"], deck: ["V1", "V3", "V3"], playPoints: 2 } }).play("CP03-119").pick("V5");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["V1"], ["V3", "V3", "V5"]]);
  });

  it("120 Emergency Alarmer — Fanfare: refresh a Vanguard follower, which can't attack enemy leaders this turn", () => {
    const t = d({ me: { hand: ["CP03-120"], field: [{ card: "CP03-113", engaged: true }], playPoints: 1 } }).play("CP03-120").pick("CP03-113");
    expect([t.engaged("CP03-113"), t.attackTargets("CP03-113")]).toEqual([false, []]);
  });

  it("121 Lozenge Magus — Ward; Fanfare: arrange the top 2; a resolved Trigger: leader +1", () => {
    const t = d({ me: { universe: VG, field: ["CP03-121", "CP03-086"], deck: ["CP03-038"], leaderDefense: 10 } }).attack("CP03-086", "opp:leader").yes();
    expect(t.leader()).toBe(14);
  });

  it("122 Battle Maiden, Tagitsuhime — Ride (1): 2 damage to up to 1, +1/+1; Fanfare: arrange the top 2", () => {
    const t = d({ me: { field: ["CP03-122"], evolveDeck: [DP], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-122").pick("opp:V5");
    expect([t.stats("opp:V5"), t.stats("CP03-122")]).toEqual([[5, 3], [3, 3]]);
  });

  it("123 Luck Bird — arrange the top 3, or return 5 followers with Triggers from the cemetery, draw and recover 1", () => {
    const triggers = ["CP03-015", "CP03-016", "CP03-017", "CP03-018", "CP03-038"];
    const t = d({ me: { hand: ["CP03-123"], cemetery: [...triggers, "V1"], deck: [], playPoints: 1 } }).play("CP03-123").choose("2");
    expect([t.cemetery().sort(), t.hand().length, t.zone("me", "deck").length, t.pp()]).toEqual([["CP03-123", "V1"], 1, 4, 1]);
    expect(d({ me: { hand: ["CP03-123"], cemetery: triggers.slice(1), deck: ["V1"], playPoints: 1 } }).play("CP03-123").none().zone("me", "deck")).toEqual(["V1"]);
  });

  it("124 Godhawk, Ichibyoshi — Starting Amulet; act, engage and bury, with an Oracle Think Tank follower: arrange the top 3", () => {
    const t = d({ me: { field: ["CP03-124", "CP03-113"], deck: ["V1", "V3"] } }).activate("CP03-124").pick("V3");
    expect([t.zone("me", "deck"), t.field()]).toEqual([["V3", "V1"], ["CP03-113"]]);
    expect(d({ me: { field: ["CP03-124", "V1"] } }).canActivate("CP03-124")).toBe(false);
  });

  it("125 Powers Converged — one option, up to 3 with 3 faceup Drive Points in the evolve deck", () => {
    const one = d({ me: { hand: ["CP03-125"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP03-125");
    expect(one.decision).toMatchObject({ type: "choose", min: 1, max: 1 });
    const t = d({ me: { hand: ["CP03-125"], faceUpEvolveDeck: n(3, DP), cemetery: ["V3"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP03-125");
    t.choose("1", "2", "3");
    expect([t.stats("opp:V5"), t.hand(), t.leader()]).toEqual([[5, 1], ["V3"], 24]);
  });

  it("127 Drive Point — up to 10 in the evolve deck (CR 6.1.2)", () => {
    const deck = (points: number) => ({ leader: "CP03-LD06", main: [...Array<string>(39).fill("CP03-113"), "CP03-124"], evolve: Array<string>(points).fill(DP) });
    const copies = (points: number) => E.validateDeck(deck(points)).filter((p) => p.includes("Drive Point"));
    expect([copies(10), copies(11).length]).toEqual([[], 1]);
  });
});
