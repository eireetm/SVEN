import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP20 Havencraft (093–110, T07–T10). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers; STORM (2c 2/1) has Storm; BOTH-20 (0) deals 20 damage to each leader. Omen–Zealot: BP20-097 (3c), BP20-101 (2c),
// BP20-107 (1c 0/2). Crests without end-phase abilities: BP20-T01, T05, T06, T02. Tokens: BP01-T16 Holy Falcon, BP01-T17
// Holy Tiger.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const CRESTS = ["BP20-T01", "BP20-T05", "BP20-T06"];

describe("BP20 Havencraft", () => {
  it("093 Marwynn, Despair Manifest — Fanfare: with 3 crests banish an enemy follower and leader +2, or a Crest: Marwynn", () => {
    const t = d({ me: { hand: ["BP20-093"], ex: CRESTS, playPoints: 4 }, opp: { field: ["V5"] } }).play("BP20-093").choose("banish");
    expect([t.field("opp"), t.zone("opp", "banished"), t.leader()]).toEqual([[], ["V5"], 22]);
    const two = d({ me: { hand: ["BP20-093"], ex: CRESTS.slice(0, 2), playPoints: 4 }, opp: { field: ["V5"] } }).play("BP20-093").choose("banish");
    expect([two.field("opp"), two.leader()]).toEqual([["V5"], 20]);
    expect(d({ me: { hand: ["BP20-093"], playPoints: 4 } }).play("BP20-093").ex()).toEqual(["BP20-T07"]);
  });

  it("094 / 095 Himeka, Heir to Repose — Fanfare: a Crest: Himeka; evolved: an Omen–Zealot card not named Himeka; super-evolved (2): a 4-cost or less one onto the field", () => {
    expect(d({ me: { hand: ["BP20-094"], playPoints: 2 } }).play("BP20-094").ex()).toEqual(["BP20-T08"]);
    expect(d({ me: { field: ["BP20-094"], evolveDeck: ["BP20-095"], deck: ["BP20-094", "BP20-097"], playPoints: 1 } }).evolve("BP20-094").pick("BP20-097").hand()).toEqual(["BP20-097"]);
    const s = d({ me: { field: ["BP20-094"], evolveDeck: ["BP20-095"], deck: ["BP20-097", "BP20-101"], playPoints: 3, ...SUPER } });
    s.evolve("BP20-094", { sep: true }).flush().pick("BP20-097").flush().yes().pick("BP20-101").flush();
    expect([s.hand(), s.field(), s.pp()]).toEqual([["BP20-097"], ["BP20-094", "BP20-101"], 0]);
  });

  it("096 Holy Serpent's Blessing — Fanfare: 4 damage; Last Words: leader +2, or (1): another from the deck onto the field", () => {
    expect(d({ me: { hand: ["BP20-096"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP20-096").stats("opp:V5")).toEqual([5, 1]);
    const lw = (choice: string) =>
      d({ me: { field: ["BP20-096", "BP20-104", "BP20-104"], deck: ["BP20-096"], playPoints: 2 }, opp: { field: ["V5"] } })
        .activate("BP20-104")
        .pick("BP20-096")
        .flush()
        .choose(choice);
    expect(lw("leader").leader()).toBe(22);
    const again = lw("search").yes().pick("BP20-096").flush();
    expect([again.field().filter((id) => id === "BP20-096"), again.stats("opp:V5")]).toEqual([["BP20-096"], [5, 1]]);
  });

  it("097 / 098 Congregant of Repose — Fanfare: a Crest: Congregant of Repose; evolved: 2 damage per crest in your EX area", () => {
    expect(d({ me: { hand: ["BP20-097"], playPoints: 3 } }).play("BP20-097").ex()).toEqual(["BP20-T09"]);
    expect(d({ me: { field: ["BP20-097"], evolveDeck: ["BP20-098"], ex: ["BP20-T01", "BP20-T05"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP20-097").stats("opp:V5")).toEqual([5, 1]);
  });

  it("099 Sacred Sheep — at the start of each opponent's main phase: the next damage to your leader this turn is prevented", () => {
    const t = d({ me: { field: ["BP20-099"] }, opp: { hand: ["BOTH-20"], deck: ["V1", "V1"], leaderDefense: 40 } }).end();
    t.play("opp:BOTH-20");
    expect([t.leader(), t.leader("opp")]).toEqual([20, 20]);
  });

  it("100 Shining Disenchantment — Fanfare: draw; act, engage and bury this with 3 crests: 4 damage", () => {
    expect(d({ me: { hand: ["BP20-100"], deck: ["V1"], playPoints: 2 } }).play("BP20-100").hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP20-100"], ex: CRESTS }, opp: { field: ["V5"] } }).activate("BP20-100").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { field: ["BP20-100"], ex: CRESTS.slice(0, 2) }, opp: { field: ["V5"] } }).canActivate("BP20-100")).toBe(false);
  });

  it("101 / 102 Supplicant of Repose — Fanfare: leader +2 with 3 crests; evolved: a Crest: Supplicant of Repose", () => {
    expect(d({ me: { hand: ["BP20-101"], ex: CRESTS, playPoints: 2 } }).play("BP20-101").leader()).toBe(22);
    expect(d({ me: { hand: ["BP20-101"], ex: CRESTS.slice(0, 2), playPoints: 2 } }).play("BP20-101").leader()).toBe(20);
    expect(d({ me: { field: ["BP20-101"], evolveDeck: ["BP20-102"], playPoints: 1 } }).evolve("BP20-101").ex()).toEqual(["BP20-T10"]);
  });

  it("103 Temple of Repose — Fanfare: an Omen–Zealot card from the top 3; Quick act (1), engage and bury this with 3 crests: the next damage to your leader -2 (twice: -4)", () => {
    expect(d({ me: { hand: ["BP20-103"], deck: ["BP20-107", "V1", "V3"], playPoints: 1 } }).play("BP20-103").pick("BP20-107").order().hand()).toEqual(["BP20-107"]);
    const one = d({ me: { field: ["BP20-103"], ex: CRESTS, hand: ["BOTH-20"], playPoints: 1 }, opp: { leaderDefense: 40 } }).activate("BP20-103").play("BOTH-20");
    expect(one.leader()).toBe(2);
    const two = d({ me: { field: ["BP20-103", "BP20-103"], ex: CRESTS, hand: ["BOTH-20"], playPoints: 2 }, opp: { leaderDefense: 40 } });
    two.activate("BP20-103").activate("BP20-103").play("BOTH-20");
    expect(two.leader()).toBe(4);
  });

  it("104 Winged Lion Statue — act (1), engage and bury this and another amulet: a Holy Falcon and a Holy Tiger", () => {
    const t = d({ me: { field: ["BP20-104", "BP20-100"], playPoints: 1 } }).activate("BP20-104");
    expect(t.field()).toEqual(["BP01-T16", "BP01-T17"]);
    expect(d({ me: { field: ["BP20-104"], playPoints: 1 } }).canActivate("BP20-104")).toBe(false);
  });

  it("105 / 106 Knight of the Holy Order — Ward; Fanfare: evolves if put onto the field by an ability; evolved: leader +1, draw", () => {
    const t = d({ me: { field: ["BP20-083"], evolveDeck: ["BP20-084", "BP20-106"], cemetery: ["BP20-105", "V1"], deck: ["V3"], playPoints: 5 } });
    t.evolve("BP20-083").pick("BP20-105").none().flush().yes().flush();
    expect([t.field(), t.leader(), t.hand()]).toEqual([["BP20-083", "BP20-105", "V1"], 21, ["V3"]]);
    expect(d({ me: { hand: ["BP20-105"], evolveDeck: ["BP20-106"], deck: ["V1"], playPoints: 2 } }).play("BP20-105").none().leader()).toBe(20);
  });

  it("107 Devotee of Repose — Ward; Fanfare: damage equal to your crests", () => {
    expect(d({ me: { hand: ["BP20-107"], ex: CRESTS, playPoints: 1 }, opp: { field: ["V5"] } }).play("BP20-107").none().stats("opp:V5")).toEqual([5, 2]);
  });

  it("108 Featherfolk Courier — Storm; Strike: draw; Fanfare (2): a Storm follower with 3 or less attack from the deck", () => {
    const t = d({ me: { hand: ["BP20-108"], deck: ["V1", "STORM"], playPoints: 7 } }).play("BP20-108").yes().pick("STORM");
    expect([t.field(), t.keywords("BP20-108")]).toEqual([["BP20-108", "STORM"], ["storm"]]);
    expect(d({ me: { field: ["BP20-108"], deck: ["V1"] } }).attack("BP20-108", "opp:leader").hand()).toEqual(["V1"]);
  });

  it("109 Peckish Al-mi'raj — Fanfare: a Beast follower from the top 3 into the EX area", () => {
    expect(d({ me: { hand: ["BP20-109"], deck: ["V1", "BP20-017", "V3"], playPoints: 2 } }).play("BP20-109").pick("BP20-017").order().ex()).toEqual(["BP20-017"]);
  });

  it("110 Blinding Faith — 4 to each enemy follower, leader +2, draw", () => {
    const t = d({ me: { hand: ["BP20-110"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP20-110");
    expect([t.field("opp"), t.leader(), t.hand()]).toEqual([["V5"], 22, ["V1"]]);
  });

  it("T07 Crest: Marwynn, Despair Manifest — end phase: 1 damage to an enemy leader or follower, 2 with 3 crests, 4 with 5", () => {
    const t = d({ me: { ex: ["BP20-T07", "BP20-T01", "BP20-T05"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().pick("opp:leader");
    expect(t.leader("opp")).toBe(18);
    const five = d({ me: { ex: ["BP20-T07", ...CRESTS, "BP20-T02"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().pick("opp:V5");
    expect(five.stats("opp:V5")).toEqual([5, 1]);
  });

  it("T08 Crest: Himeka, Heir to Repose — end phase: -2/-2 to an enemy follower with 3 crests, -4/-4 with 5", () => {
    expect(d({ me: { ex: ["BP20-T08", "BP20-T01", "BP20-T05"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([3, 3]);
    expect(d({ me: { ex: ["BP20-T08", ...CRESTS, "BP20-T02"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([1, 1]);
    expect(d({ me: { ex: ["BP20-T08", "BP20-T01"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([5, 5]);
  });

  it("T09 Crest: Congregant of Repose — end phase: +1/+1 to an Omen follower of yours with 3 crests", () => {
    expect(d({ me: { ex: ["BP20-T09", "BP20-T01", "BP20-T05"], field: ["BP20-107"] }, opp: { deck: ["V1"] } }).end().none().stats("BP20-107")).toEqual([1, 3]);
  });

  it("T10 Crest: Supplicant of Repose — end phase: leader +1 with 3 crests", () => {
    expect(d({ me: { ex: ["BP20-T10", "BP20-T01", "BP20-T05"] }, opp: { deck: ["V1"] } }).end().leader()).toBe(21);
    expect(d({ me: { ex: ["BP20-T10", "BP20-T01"] }, opp: { deck: ["V1"] } }).end().leader()).toBe(20);
  });
});
