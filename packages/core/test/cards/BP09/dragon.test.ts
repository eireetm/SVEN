import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP09 Dragoncraft (052–068). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5, WARD 2c 1/3 Ward; AMULET is an
// amulet. Dragoncraft spells: BP01-098 Blazing Breath (1), BP01-100 Dragon Emissary (1, looks at the
// top 5), BP02-068 Draconic Armor (1), BP03-066 Draconic Smash (2). BP01-096 Mist Dragon is a 4/4
// Wyrmkin follower. Tokens: BP01-T11 Dragon, BP02-T05 Megalorca.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DRAGON = "BP01-T11";

describe("BP09 Dragoncraft", () => {
  it("052 / 053 Jerva — discards your hand; end phase: 5 damage to each other follower and a draw (evolved: each enemy leader too)", () => {
    const fan = d({ me: { hand: ["BP09-052", "V1", "V3"], playPoints: 5 } }).play("BP09-052");
    expect([fan.hand(), fan.cemetery()]).toEqual([[], ["V1", "V3"]]);
    const t = d({ me: { field: ["BP09-052", "V5"], deck: ["V1"] }, opp: { field: ["V3", "V5"], deck: ["V1"] } }).end();
    expect([t.field(), t.field("opp"), t.hand(), t.leader("opp")]).toEqual([["BP09-052"], [], ["V1"], 20]);
    const evo = d({ me: { field: [{ card: "BP09-052", evolvedInto: "BP09-053" }], deck: ["V1"] }, opp: { field: ["V3"], deck: ["V1"] } }).end();
    expect([evo.field("opp"), evo.leader("opp")]).toEqual([[], 15]);
  });

  it("054 Zirnitra — bury a Zirnitra follower: 3 less; a Dragon and a draw for each Wyrmkin token; they have Storm", () => {
    const t = d({ me: { hand: ["BP09-054"], field: ["BP09-054"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP09-054");
    expect([t.field(), t.cemetery(), t.hand(), t.pp(), t.keywords(DRAGON)]).toEqual([["BP09-054", DRAGON], ["BP09-054"], ["V1"], 0, ["storm"]]);
    const two = d({ me: { hand: ["BP09-054"], field: [DRAGON], deck: ["V1", "V3"], playPoints: 6 } }).play("BP09-054");
    expect(two.hand()).toEqual(["V1", "V3"]);
    expect(d({ me: { hand: ["BP09-054"], playPoints: 5 } }).canPlay("BP09-054")).toBe(false);
  });

  it("055 / 056 Lindworm — recovers play points for each Dragoncraft spell in the cemetery; Virtuous: Ward, end phase leader +6 and 3 cards", () => {
    const t = d({ me: { hand: ["BP09-055"], cemetery: ["BP01-098", "BP01-100", "BP02-068", "V1"], playPoints: 10 } }).play("BP09-055");
    expect(t.pp()).toBe(3);
    const lindworm = { card: "BP09-055", evolvedInto: "BP09-056" };
    const end = d({ me: { field: [lindworm], deck: ["V1", "V1", "V1"] }, opp: { deck: ["V1"] } }).end().none();
    expect([end.leader(), end.hand()]).toEqual([26, ["V1", "V1", "V1"]]);
  });

  it("056_back Iniquitous Lindworm — Storm; ignores Ward", () => {
    const t = d({ me: { field: ["BP09-055"], evolveDeck: ["BP09-056"], playPoints: 5 }, opp: { field: [{ card: "WARD", engaged: true }, { card: "V1", engaged: true }] } });
    expect(t.attackTargets("BP09-055")).toEqual(["WARD"]);
    t.evolve("BP09-055", { into: "BP09-056_back" });
    expect([t.keywords("BP09-055"), t.attackTargets("BP09-055")]).toEqual([["storm"], ["WARD", "V1", "opp:leader"]]);
  });

  it("057 Dragonplate Warrior — Overflow: recover 2; on your turn a Dragoncraft spell you play deals 2 to each enemy follower", () => {
    expect(d({ me: { hand: ["BP09-057"], playPoints: 7 } }).play("BP09-057").pp()).toBe(4);
    expect(d({ me: { hand: ["BP09-057"], playPoints: 6 } }).play("BP09-057").pp()).toBe(1);
    const t = d({ me: { field: ["BP09-057"], hand: ["BP01-100"] }, opp: { field: ["V3"] } }).play("BP01-100");
    expect(t.stats("opp:V3")).toEqual([3, 2]);
  });

  it("058 Force of the Dragonewt — Quick: 3 damage, draw, discard; needs a target", () => {
    const t = d({ me: { hand: ["BP09-058", "V1"], deck: ["V3"] }, opp: { field: ["V5"] } }).play("BP09-058").pick("V1");
    expect([t.stats("opp:V5"), t.hand(), t.cemetery()]).toEqual([[5, 2], ["V3"], ["V1", "BP09-058"]]);
    expect(d({ me: { hand: ["BP09-058"] } }).canPlay("BP09-058")).toBe(false);
  });

  it("059 / 060 Roy — searches a 2-cost Dragoncraft spell; evolved: 2 damage, 5 to a Wyrmkin follower", () => {
    const t = d({ me: { hand: ["BP09-059"], deck: ["BP01-098", "BP03-066", "V1"] } }).play("BP09-059").pick("BP03-066");
    expect(t.hand()).toEqual(["BP03-066"]);
    const wyrm = d({ me: { field: ["BP09-059"], evolveDeck: ["BP09-060"] }, opp: { field: ["BP01-096", "V5"] } }).evolve("BP09-059").pick("opp:BP01-096");
    expect(wyrm.field("opp")).toEqual(["V5"]);
    const other = d({ me: { field: ["BP09-059"], evolveDeck: ["BP09-060"] }, opp: { field: ["V5"] } }).evolve("BP09-059");
    expect(other.stats("opp:V5")).toEqual([5, 3]);
  });

  it("061 Galua — Fanfare, pay 2: destroy an enemy card", () => {
    const t = d({ me: { hand: ["BP09-061"], playPoints: 6 }, opp: { field: ["V5", "AMULET"] } }).play("BP09-061").yes().pick("opp:AMULET");
    expect([t.field("opp"), t.pp()]).toEqual([["V5"], 0]);
    const declined = d({ me: { hand: ["BP09-061"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP09-061").no();
    expect([declined.field("opp"), declined.pp()]).toEqual([["V5"], 2]);
  });

  it("062 Waters of the Megalorca — a Megalorca, 2 with Overflow", () => {
    expect(d({ me: { hand: ["BP09-062"] } }).play("BP09-062").field()).toEqual(["BP02-T05"]);
    expect(d({ me: { hand: ["BP09-062"], playPoints: 7 } }).play("BP09-062").field()).toEqual(["BP02-T05", "BP02-T05"]);
  });

  it("063 / 064 Heroic Dragonslayer — Overflow: +2 attack; evolved: damage equal to its attack (the +2 counts)", () => {
    const t = d({ me: { hand: ["BP09-063"], evolveDeck: ["BP09-064"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP09-063");
    expect(t.stats("BP09-063")).toEqual([3, 2]);
    t.evolve("BP09-063");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
  });

  it("065 Dragonclad Blademaster — act: 3 damage, only with 3 Draconic Duelist cards on your field (itself included)", () => {
    expect(d({ me: { field: ["BP09-065", "BP09-059"] }, opp: { field: ["V5"] } }).canActivate("BP09-065")).toBe(false);
    const t = d({ me: { field: ["BP09-065", "BP09-059", "BP09-059"] }, opp: { field: ["V5"] } }).activate("BP09-065");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
  });

  it("066 Drakewing Assassin — damage equal to the Dragoncraft spells in your cemetery", () => {
    const t = d({ me: { hand: ["BP09-066"], cemetery: ["BP01-098", "BP01-100", "V1"] }, opp: { field: ["V3"] } }).play("BP09-066");
    expect(t.stats("opp:V3")).toEqual([3, 2]);
  });

  it("067 Coda — a Dragon", () => {
    expect(d({ me: { hand: ["BP09-067"], playPoints: 4 } }).play("BP09-067").field()).toEqual(["BP09-067", DRAGON]);
  });

  it("068 Dragon's Handspur — 2 damage and a draw; needs a target", () => {
    const t = d({ me: { hand: ["BP09-068"], deck: ["V1"] }, opp: { field: ["V3"] } }).play("BP09-068");
    expect([t.stats("opp:V3"), t.hand()]).toEqual([[3, 2], ["V1"]]);
    expect(d({ me: { hand: ["BP09-068"] } }).canPlay("BP09-068")).toBe(false);
  });
});
