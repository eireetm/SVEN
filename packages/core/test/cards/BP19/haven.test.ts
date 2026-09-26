import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP19 Havencraft (092–109). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your followers.
// BP19-001 is a Condemned follower without other abilities; BP01-135 Prism Priestess a 1-cost Faith follower; BP19-099 Meus
// Gourmand a 1-cost Beast follower; BP19-108 Luminescent Gem a 0-cost amulet. Token: BP01-T17 Holy Tiger (4/4, Rush).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TIGER = "BP01-T17";

describe("BP19 Havencraft", () => {
  it("092 Erralde, Troth Convict — its own end-phase ability activates twice; choose 1, up to 2 with another Condemned follower: 4 damage / leader +1 and refresh / draw", () => {
    const t = d({ me: { field: ["BP19-092"], deck: ["V1", "V3"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().flush();
    t.choose("damage").flush().choose("draw");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 1], ["V1"]]);
    const two = d({ me: { field: [{ card: "BP19-092", engaged: true }, "BP19-001"], deck: ["V1", "V3"] }, opp: { field: ["V5"], deck: ["V1"] } });
    two.end().flush().choose("damage", "leader").flush().choose("leader", "draw");
    expect([two.stats("opp:V5"), two.leader(), two.engaged("BP19-092"), two.hand()]).toEqual([[5, 1], 22, false, ["V1"]]);
  });

  it("093 / 094 Uneriel, Winged Enforcer — Fanfare: draw 2; evolved: destroy your amulets, X damage to each enemy, leader +X, recover X", () => {
    expect(d({ me: { hand: ["BP19-093"], deck: ["V1", "V3"], playPoints: 6 } }).play("BP19-093").hand()).toEqual(["V1", "V3"]);
    const e = d({ me: { field: ["BP19-093", "BP19-108", "AMULET"], evolveDeck: ["BP19-094"], playPoints: 1, maxPlayPoints: 7 }, opp: { field: ["V5"] } });
    e.evolve("BP19-093").flush();
    expect([e.field(), e.stats("opp:V5"), e.leader("opp"), e.leader(), e.pp()]).toEqual([["BP19-093"], [5, 3], 18, 23, 2]);
  });

  it("095 Zoe, Queen of Hope — Ward; Fanfare: a 1-cost Faith follower from the deck, leader +4", () => {
    const t = d({ me: { hand: ["BP19-095"], deck: ["V1", "BP01-135"], playPoints: 4 } }).play("BP19-095").none().pick("BP01-135");
    expect([t.hand(), t.leader(), t.keywords("BP19-095")]).toEqual([["BP01-135"], 24, ["ward"]]);
  });

  it("096 / 097 Warden of the Wings — Last Words: may summon a 1-cost or less amulet from the hand; evolved: an amulet or Uneriel from the top 4", () => {
    const t = d({ me: { field: ["BP19-096"], hand: ["QUICK-SAC", "BP19-108", "BP19-109"] } }).play("QUICK-SAC").pick("BP19-108");
    expect([t.field(), t.hand()]).toEqual([["BP19-108"], ["BP19-109"]]);
    const e = d({ me: { field: ["BP19-096"], evolveDeck: ["BP19-097"], deck: ["V1", "BP19-093", "V3", "BP19-108"], playPoints: 1 } });
    e.evolve("BP19-096").pick("BP19-093").order();
    expect(e.hand()).toEqual(["BP19-093"]);
  });

  it("098 Executor of the Oath — engage an Erralde: costs 0; Fanfare: an Agent or a Follower of the Precepts from the deck; end phase: 2 damage", () => {
    const t = d({ me: { hand: ["BP19-098"], field: ["BP19-092"], deck: ["V1", "BP19-100"], playPoints: 0 } }).play("BP19-098").pick("BP19-100");
    expect([t.field(), t.engaged("BP19-092")]).toEqual([["BP19-092", "BP19-098", "BP19-100"], true]);
    expect(d({ me: { hand: ["BP19-098"], playPoints: 4 } }).canPlay("BP19-098")).toBe(false);
    expect(d({ me: { field: ["BP19-098"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([5, 3]);
  });

  it("099 Meus Gourmand — Fanfare: if not put onto the field from the hand, 2 to each enemy leader or leader +2", () => {
    expect(d({ me: { hand: ["BP19-099"], playPoints: 1 } }).play("BP19-099").leader("opp")).toBe(20);
    expect(d({ me: { ex: ["BP19-099"], playPoints: 1 } }).play("BP19-099@ex").choose("damage").leader("opp")).toBe(18);
    expect(d({ me: { ex: ["BP19-099"], playPoints: 1 } }).play("BP19-099@ex").choose("leader").leader()).toBe(22);
  });

  it("100 / 101 Agent of the Commandments — engage an Erralde: costs 0; end phase: leader +1; evolved: an Erralde from the deck", () => {
    const t = d({ me: { hand: ["BP19-100"], field: ["BP19-092"], playPoints: 2 } }).play("BP19-100").choose("erralde");
    expect([t.pp(), t.engaged("BP19-092")]).toEqual([2, true]);
    expect(d({ me: { field: ["BP19-100"] }, opp: { deck: ["V1"] } }).end().leader()).toBe(21);
    expect(d({ me: { field: ["BP19-100"], evolveDeck: ["BP19-101"], deck: ["V1", "BP19-092"], playPoints: 1 } }).evolve("BP19-100").pick("BP19-092").hand()).toEqual(["BP19-092"]);
    expect(d({ me: { field: [{ card: "BP19-100", evolvedInto: "BP19-101" }] }, opp: { deck: ["V1"] } }).end().leader()).toBe(21);
  });

  it("102 Follower of the Precepts — engage an Erralde: costs 0; end phase: 1 damage", () => {
    expect(d({ me: { hand: ["BP19-102"], field: ["BP19-092"], playPoints: 0 } }).canPlay("BP19-102")).toBe(true);
    expect(d({ me: { hand: ["BP19-102"], field: [{ card: "BP19-092", engaged: true }], playPoints: 0 } }).canPlay("BP19-102")).toBe(false);
    expect(d({ me: { field: ["BP19-102"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([5, 4]);
  });

  it("103 Sacrosanct Temple / 108 Luminescent Gem — act (1), engage and bury an amulet (this one too): 1 damage; Gem Last Words: leader +1", () => {
    const self = d({ me: { field: ["BP19-103"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP19-103");
    expect([self.stats("opp:V5"), self.field(), self.pp()]).toEqual([[5, 4], [], 0]);
    const gem = d({ me: { field: ["BP19-103", "BP19-108"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP19-103").pick("BP19-108");
    expect([gem.stats("opp:V5"), gem.field(), gem.engaged("BP19-103"), gem.leader()]).toEqual([[5, 4], ["BP19-103"], true, 21]);
  });

  it("104 / 105 Sacred Tiger — your Holy Tigers have Ward; Fanfare / evolved: a Holy Tiger; act, bury an amulet: Storm", () => {
    const t = d({ me: { hand: ["BP19-104"], playPoints: 6 } }).play("BP19-104").none();
    expect([t.field(), t.keywords(TIGER)]).toEqual([["BP19-104", TIGER], ["rush", "ward"]]);
    const act = d({ me: { field: ["BP19-104", "BP19-108"] } }).activate("BP19-104");
    expect([act.keywords("BP19-104"), act.leader()]).toEqual([["storm"], 21]);
    const e = d({ me: { field: ["BP19-104"], evolveDeck: ["BP19-105"], playPoints: 1 } }).evolve("BP19-104").none();
    expect([e.field(), e.keywords(TIGER)]).toEqual([["BP19-104", TIGER], ["rush", "ward"]]);
    expect(d({ me: { field: [TIGER] } }).keywords(TIGER)).toEqual(["rush"]);
  });

  it("106 Avaricious Altruist — Fanfare: a 1-cost or less Beast follower or amulet from the deck onto the field", () => {
    const t = d({ me: { hand: ["BP19-106"], deck: ["V1", "BP19-099"], playPoints: 3 } }).play("BP19-106").pick("BP19-099").choose("damage");
    expect([t.field(), t.leader("opp")]).toEqual([["BP19-106", "BP19-099"], 18]);
  });

  it("107 Sword Al-mi'raj — Storm; end phase: a follower of yours gets its original defense back", () => {
    const t = d({ me: { field: ["BP19-107"] }, opp: { field: [{ card: "V5", engaged: true }], deck: ["V1"] } }).attack("BP19-107", "opp:V5");
    expect(t.stats("BP19-107")).toEqual([3, 1]);
    expect(t.end().stats("BP19-107")).toEqual([3, 6]);
    expect(d({ me: { field: [{ card: "V5", damage: 3 }, "BP19-107"] }, opp: { deck: ["V1"] } }).end().pick("V5").stats("V5")).toEqual([5, 5]);
  });

  it("109 Holybeast Ruins — Fanfare / Last Words: a Holy Tiger", () => {
    expect(d({ me: { hand: ["BP19-109"], playPoints: 4 } }).play("BP19-109").field()).toEqual(["BP19-109", TIGER]);
    const lw = d({ me: { field: ["BP19-103", "BP19-109"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP19-103").pick("BP19-109");
    expect(lw.field()).toEqual(["BP19-103", TIGER]);
  });
});
