import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP02 Neutral (106–120). "V1".."V5" are vanilla test followers (cost N, V1 = 2/2, V2 = 2/3,
// V3 = 3/4, V5 = 5/5, Neutral).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP02 Neutral", () => {
  it("106 Dark Angel Olivia — choose up to 2: gain an EP (no limit), leader +3, draw, the opponent discards", () => {
    const t = d({ me: { hand: ["BP02-106"], deck: ["V1"], playPoints: 5, evolutionPoints: 3 }, opp: { hand: ["V2", "V3"] } });
    t.play("BP02-106");
    expect(() => t.choose("1", "2", "3")).toThrow();
    t.choose("1", "4").pick("opp:V2");
    expect([t.game.state.players[0].evolutionPoints, t.hand("opp"), t.hand()]).toEqual([4, ["V3"], []]);
    const other = d({ me: { hand: ["BP02-106"], deck: ["V1"], playPoints: 5 } }).play("BP02-106").choose("2", "3");
    expect([other.leader(), other.hand()]).toEqual([23, ["V1"]]);
  });

  it("107 / 108 Bahamut — destroys every other follower; no leader attacks while 2+ enemy followers; evolved destroys every amulet", () => {
    const t = d({ me: { hand: ["BP02-107"], field: ["V1"], playPoints: 9 }, opp: { field: ["V5", "V3", "AMULET"] } }).play("BP02-107");
    expect([t.field(), t.field("opp")]).toEqual([["BP02-107"], ["AMULET"]]);
    const two = d({ me: { field: ["BP02-107"] }, opp: { field: [{ card: "V1", engaged: true }, { card: "V2", engaged: true }] } });
    expect(two.attackTargets("BP02-107")).toEqual(["V1", "V2"]);
    const one = d({ me: { field: ["BP02-107"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    expect(one.attackTargets("BP02-107")).toEqual(["V1", "opp:leader"]);
    const evo = d({ me: { field: ["BP02-107", "AMULET"], evolveDeck: ["BP02-108"] }, opp: { field: ["AMULET", "V1"] } }).evolve("BP02-107");
    expect([evo.field(), evo.field("opp")]).toEqual([["BP02-107"], ["V1"]]);
  });

  it("109 Demonic Simulacrum — 3 damage to your leader and a random discard", () => {
    const t = d({ me: { hand: ["BP02-109", "V1", "V2"], playPoints: 3 } }).play("BP02-109");
    expect([t.leader(), t.hand().length, t.cemetery().length]).toEqual([17, 1, 1]);
  });

  it("110 / 111 Archangel Reina — Ward; evolved recovers 1 PP per faceup follower in the evolve deck and turns them facedown", () => {
    const t = d({
      me: { field: [{ card: "BP01-171", evolvedInto: "BP01-172" }, "BP02-110"], evolveDeck: ["BP02-111"], playPoints: 1 },
      opp: { field: [{ card: "V5", engaged: true }] },
    });
    t.attack("BP01-171", "opp:V5"); // the evolved Goblin dies; its evolved card returns faceup (CR 11.6.1)
    const goblin = () => t.game.state.cards[t.id("BP01-172@evolveDeck")]!;
    expect(goblin().faceUp).toBe(true);
    t.evolve("BP02-110");
    expect([t.pp(), goblin().faceUp, t.keywords("BP02-110@field")]).toEqual([1, false, ["ward"]]);
  });

  it("112 Surefire Bullet — Quick; 3 damage, 4 to an evolved follower", () => {
    expect(d({ me: { hand: ["BP02-112"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP02-112").stats("opp:V5")).toEqual([5, 2]);
    const evolved = d({ me: { hand: ["BP02-112"], playPoints: 2 }, opp: { field: [{ card: "BP01-171", evolvedInto: "BP01-172" }] } });
    expect(evolved.play("BP02-112").field("opp")).toEqual([]);
  });

  it("113 / 114 Unicorn Dancer Unica — Strike: leader +2", () => {
    expect(d({ me: { field: ["BP02-113"] } }).attack("BP02-113", "opp:leader").leader()).toBe(22);
    expect(d({ me: { field: [{ card: "BP02-113", evolvedInto: "BP02-114" }] } }).attack("BP02-113", "opp:leader").leader()).toBe(22);
  });

  it("115 Gourmet Emperor Khaiza — destroy an enemy follower costing 2 or less; its leader gets +3", () => {
    const t = d({ me: { hand: ["BP02-115"], playPoints: 3 }, opp: { field: ["V2", "V3"] } }).play("BP02-115");
    expect([t.field("opp"), t.leader("opp")]).toEqual([["V3"], 23]);
  });

  it("116 Call of Cocytus — Quick; destroy an enemy follower, then search a Neutral follower; needs a target", () => {
    const t = d({ me: { hand: ["BP02-116"], deck: ["BP02-013", "BP02-110"], playPoints: 6 }, opp: { field: ["V5"] } });
    t.play("BP02-116").pick("BP02-110");
    expect([t.field("opp"), t.hand()]).toEqual([[], ["BP02-110"]]);
    expect(d({ me: { hand: ["BP02-116"], deck: ["BP02-110"], playPoints: 6 } }).canPlay("BP02-116")).toBe(false);
  });

  it("117 Hamsa — +X attack for the revealed top card's cost", () => {
    const t = d({ me: { hand: ["BP02-117"], deck: ["V5"], playPoints: 3 } }).play("BP02-117");
    expect([t.stats("BP02-117"), t.zone("me", "deck")]).toEqual([[5, 3], ["V5"]]);
    expect(d({ me: { hand: ["BP02-117"], playPoints: 3 } }).play("BP02-117").stats("BP02-117")).toEqual([0, 3]);
  });

  it("118 / 119 Sektor — evolve for 3; evolved has Ward", () => {
    const t = d({ me: { field: ["BP02-118"], evolveDeck: ["BP02-119"], playPoints: 3 } }).evolve("BP02-118");
    expect([t.stats("BP02-118@field"), t.keywords("BP02-118@field")]).toEqual([[4, 4], ["ward"]]);
  });

  it("120 Dance of Death — 5 damage to an enemy follower and 2 to its leader", () => {
    const t = d({ me: { hand: ["BP02-120"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP02-120");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 18]);
  });
});
