import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP03 Dragoncraft (055–072). WEAPON is Draconic Weapon. Overflow is max play points of 7 or more.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const WEAPON = "BP02-T07";

describe("BP03 Dragoncraft", () => {
  it("055 Jabberwock — optional bury, then the next costlier follower; a miss shuffles everything back", () => {
    const hit = d({ me: { hand: ["BP03-055"], field: ["V1"], deck: ["BP01-179", "V5"], playPoints: 7 } });
    hit.play("BP03-055").yes();
    expect([hit.field(), hit.cemetery(), hit.zone("me", "deck")]).toEqual([["BP03-055", "V5"], ["V1"], ["BP01-179"]]);
    const miss = d({ me: { hand: ["BP03-055"], field: ["V5"], deck: ["V1", "V2"], playPoints: 7 } });
    miss.play("BP03-055").yes();
    expect([miss.field(), miss.cemetery(), miss.zone("me", "deck").sort()]).toEqual([["BP03-055"], ["V5"], ["V1", "V2"]]);
    const decline = d({ me: { hand: ["BP03-055"], field: ["V1"], deck: ["V5"], playPoints: 7 } });
    decline.play("BP03-055").no();
    expect([decline.field(), decline.zone("me", "deck")]).toEqual([["V1", "BP03-055"], ["V5"]]);
    const evolved = d({
      me: { hand: ["BP03-055"], field: [{ card: "BP03-023", evolvedInto: "BP03-024" }], deck: ["V3"], playPoints: 7 },
    });
    evolved.play("BP03-055").yes();
    expect(evolved.field()).toEqual(["BP03-055", "V3"]);
    expect(evolved.cemetery()).toContain("BP03-023");
  });

  it("056 / 057 / 058 Lævateinn Dragon — evolve into a name that contains it; Attack Form strikes and is also that name on the field", () => {
    const normal = d({ me: { field: ["BP03-056"], evolveDeck: ["BP03-057"], playPoints: 1 } }).evolve("BP03-056");
    expect([normal.stats("BP03-056"), normal.keywords("BP03-056"), normal.field(), normal.pp()]).toEqual([
      [6, 6],
      ["assail"],
      ["BP03-056", WEAPON],
      2,
    ]);
    const form = d({
      me: { field: ["BP03-056"], evolveDeck: ["BP03-058"], playPoints: 1 },
      opp: { field: [{ card: "V5", engaged: true }, { card: "ZERO", engaged: true }] },
    });
    form.evolve("BP03-056");
    expect(form.stats("BP03-056")).toEqual([7, 5]);
    const onField = form.game.state.players[0].zones.field.find((id) => form.game.state.cards[id]!.def === "BP03-056")!;
    expect(form.game.reader().info(onField).names).toEqual(["Lævateinn Dragon, Attack Form", "Lævateinn Dragon"]);
    form.attack("BP03-056", "opp:ZERO").pick("opp:V5");
    expect([form.stats("opp:V5"), form.leader("opp"), form.field("opp")]).toEqual([[5, 1], 17, ["V5"]]);

    const handed = d({ me: { hand: ["BP03-056"] } });
    const inHand = handed.game.state.players[0].zones.hand[0]!;
    expect(handed.game.reader().info(inHand).names).toEqual(["Lævateinn Dragon"]);
  });

  it("059 Red Ragewyrm — engage for +5 attack, or +10 while Overflow is active", () => {
    const plain = d({ me: { field: ["BP03-059"], maxPlayPoints: 6 } }).activate("BP03-059");
    expect([plain.stats("BP03-059"), plain.engaged("BP03-059")]).toEqual([[5, 5], true]);
    const over = d({ me: { field: ["BP03-059"], maxPlayPoints: 7 } }).activate("BP03-059");
    expect(over.stats("BP03-059")).toEqual([10, 5]);
  });

  it("060 / 061 Draconir, Knuckle Dragon — summon a Draconic Weapon; evolve deals 2, or 4 beside another Armed follower", () => {
    const t = d({ me: { hand: ["BP03-060"], playPoints: 3 } }).play("BP03-060");
    expect(t.field()).toEqual(["BP03-060", WEAPON]);
    const two = d({
      me: { field: ["BP03-060", "BP03-056"], evolveDeck: ["BP03-061"], playPoints: 1 },
      opp: { field: ["V5"] },
    });
    two.evolve("BP03-060");
    expect([two.stats("BP03-060"), two.stats("opp:V5")]).toEqual([[4, 4], [5, 1]]);
    const one = d({ me: { field: ["BP03-060"], evolveDeck: ["BP03-061"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    one.evolve("BP03-060").pick("opp:V3");
    expect([one.stats("opp:V3"), one.stats("opp:V5")]).toEqual([[3, 2], [5, 5]]);
  });

  it("062 Tilting at Windmills — may put a follower from hand and destroy it at your end phase, even after it evolves", () => {
    const plain = d({ me: { field: ["BP03-062"], hand: ["V1"], playPoints: 3, deck: ["V2"] }, opp: { deck: ["V1"] } });
    plain.activate("BP03-062").yes();
    expect([plain.field(), plain.pp(), plain.engaged("BP03-062")]).toEqual([["BP03-062", "V1"], 0, true]);
    plain.end();
    expect([plain.field(), plain.cemetery()]).toEqual([["BP03-062"], ["V1"]]);
    const evolved = d({
      me: { field: ["BP03-062"], hand: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 5, deck: ["V1"] },
      opp: { deck: ["V1"] },
    });
    evolved.activate("BP03-062").yes().evolve("EVOLVER");
    expect(evolved.stats("EVOLVER")).toEqual([4, 4]);
    evolved.end();
    expect(evolved.cemetery()).toContain("EVOLVER");
    expect(evolved.field()).toEqual(["BP03-062"]);
    const no = d({ me: { field: ["BP03-062"], hand: ["V1"], playPoints: 3 } }).activate("BP03-062").no();
    expect([no.hand(), no.field(), no.pp()]).toEqual([["V1"], ["BP03-062"], 0]);
  });

  it("063 Master of Draconic Arts — Ward and Assail; Overflow also gives +4 attack and Rush", () => {
    const over = d({ me: { hand: ["BP03-063"], maxPlayPoints: 7, playPoints: 3 }, opp: { field: ["V1"] } });
    over.play("BP03-063").none();
    expect([over.stats("BP03-063"), over.keywords("BP03-063"), over.attackTargets("BP03-063")]).toEqual([
      [6, 4],
      ["assail", "ward", "rush"],
      ["V1"],
    ]);
    const plain = d({ me: { hand: ["BP03-063"], maxPlayPoints: 6, playPoints: 3 }, opp: { field: ["V1"] } });
    plain.play("BP03-063").none();
    expect([plain.stats("BP03-063"), plain.keywords("BP03-063"), plain.attackTargets("BP03-063")]).toEqual([[2, 4], ["assail", "ward"], []]);
  });

  it("064 / 065 Hammer Dragonewt — an Armed spell from the top 4; evolve deals 2 to the enemy leader", () => {
    const t = d({ me: { hand: ["BP03-064"], deck: ["BP03-066", "V1"], evolveDeck: ["BP03-065"], playPoints: 3 } });
    t.play("BP03-064").pick("BP03-066");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["BP03-066"], ["V1"]]);
    t.evolve("BP03-064");
    expect([t.stats("BP03-064"), t.leader("opp")]).toEqual([[3, 3], 18]);
    const skip = d({ me: { hand: ["BP03-064"], deck: ["V1"], playPoints: 2 } }).play("BP03-064");
    expect(skip.zone("me", "deck")).toEqual(["V1"]);
  });

  it("066 Draconic Smash — Quick, 3 damage and a Draconic Weapon", () => {
    const t = d({
      turn: 6,
      me: { hand: ["BP03-066"], field: [{ card: "ZERO", engaged: true }], playPoints: 2, deck: ["V1"] },
      opp: { field: ["V5"], deck: ["V1"] },
    });
    t.attack("opp:V5", "ZERO").quick("BP03-066");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 2], [WEAPON]]);
  });

  it("067 Elder Tortoise — gain an evolution point, and +2/+2 during Overflow", () => {
    const plain = d({ me: { hand: ["BP03-067"], maxPlayPoints: 6, playPoints: 4 } });
    const before = plain.game.state.players[0].evolutionPoints;
    plain.play("BP03-067");
    expect([plain.game.state.players[0].evolutionPoints, plain.stats("BP03-067")]).toEqual([before + 1, [3, 5]]);
    const over = d({ me: { hand: ["BP03-067"], maxPlayPoints: 7, playPoints: 4 } }).play("BP03-067");
    expect(over.stats("BP03-067")).toEqual([5, 7]);
  });

  it("068 Trinity Dragon — Intimidate", () => {
    const t = d({ me: { field: ["V5"] }, opp: { field: ["BP03-068", { card: "V1", engaged: true }] } });
    expect(t.keywords("opp:BP03-068")).toEqual(["intimidate"]);
    expect(t.attackTargets("V5")).toEqual(["V1", "opp:leader"]);
  });

  it("069 / 070 Dragon Summoner — evolve, then a Dragoncraft follower from the top 3", () => {
    const t = d({ me: { field: ["BP03-069"], evolveDeck: ["BP03-070"], deck: ["V1", "BP03-060", "V2"], playPoints: 1 } });
    t.evolve("BP03-069").pick("BP03-060").order();
    expect([t.stats("BP03-069"), t.hand(), t.zone("me", "deck")]).toEqual([[2, 4], ["BP03-060"], ["V1", "V2"]]);
    const skip = d({ me: { field: ["BP03-069"], evolveDeck: ["BP03-070"], deck: ["V1"], playPoints: 1 } });
    skip.evolve("BP03-069");
    expect(skip.zone("me", "deck")).toEqual(["V1"]);
  });

  it("071 Lance Lizard — Overflow summons a weapon; being selected on your turn gives +1 and pings once", () => {
    const over = d({ me: { hand: ["BP03-071"], maxPlayPoints: 7, playPoints: 3 } }).play("BP03-071");
    expect(over.field()).toEqual(["BP03-071", WEAPON]);
    const no = d({ me: { hand: ["BP03-071"], maxPlayPoints: 6, playPoints: 3 } }).play("BP03-071");
    expect(no.field()).toEqual(["BP03-071"]);

    const t = d({
      me: { field: ["BP03-071"], deck: ["V1"] },
      opp: { hand: ["BP01-179", "BP01-179"], playPoints: 2, deck: ["V1"] },
    });
    t.end().quick("opp:BP01-179");
    expect([t.stats("BP03-071"), t.leader("opp")]).toEqual([[4, 2], 19]);
    t.quick("opp:BP01-179");
    expect([t.leader("opp"), t.field(), t.cemetery()]).toEqual([19, [], ["BP03-071"]]);
  });

  it("072 Armor Burst — an Armed follower to EX, 3 damage, and a Draconic Weapon", () => {
    const t = d({ me: { hand: ["BP03-072"], field: ["BP03-060"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    t.play("BP03-072").pick("opp:V5");
    expect([t.field(), t.ex(), t.stats("opp:V5")]).toEqual([[WEAPON], ["BP03-060"], [5, 2]]);
    const full = d({
      me: { hand: ["BP03-072"], field: ["BP03-071"], ex: ["V1", "V1", "V1", "V1", "V1"], playPoints: 1 },
      opp: { field: ["V5"] },
    });
    full.play("BP03-072");
    expect([full.field(), full.ex(), full.stats("opp:V5")]).toEqual([["BP03-071", WEAPON], ["V1", "V1", "V1", "V1", "V1"], [5, 2]]);
  });
});
