import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP09 Abysscraft (069–085). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; QUICK-SAC destroys a follower of
// yours (0). BP02-078 Veight is a Vampire card, BP02-069 Vania, Vampire Princess a Vampire follower
// with "Vania" in its name, BP01-109 Hell's Unleasher an Abysscraft follower, BP01-108 Dire Bond an
// amulet whose Fanfare deals 1 damage to your leader. Tokens: BP01-T15 Forest Bat, BP01-T14 Ghost.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const BAT = "BP01-T15";
const VAMPIRES = ["BP02-078", "BP02-078", "BP02-078", "BP02-078", "BP02-078"];

describe("BP09 Abysscraft", () => {
  it("069 / 070 Vania — a Forest Bat into the EX area; Kind Queen: draw and discard, Bats cost 1 less and give your leader +1", () => {
    expect(d({ me: { hand: ["BP09-069"] } }).play("BP09-069").ex()).toEqual([BAT]);
    const t = d({ me: { field: ["BP09-069"], evolveDeck: ["BP09-070"], ex: [BAT], deck: ["V1"], hand: ["V3"], playPoints: 1 } });
    t.evolve("BP09-069", { into: "BP09-070" }).pick("V3");
    expect([t.hand(), t.pp(), t.canPlay(BAT)]).toEqual([["V1"], 0, true]);
    t.play(BAT);
    expect(t.leader()).toBe(21);
  });

  it("070_back Vania, Blood Queen — evolves only with 5 Vampire cards in the cemetery; Storm; a Forest Bat put onto your field deals 3", () => {
    const four = d({ me: { field: ["BP09-069"], evolveDeck: ["BP09-070"], cemetery: VAMPIRES.slice(1), playPoints: 3 } });
    expect(four.canEvolve("BP09-069")).toBe(true);
    expect(() => four.evolve("BP09-069", { into: "BP09-070_back" })).toThrow();
    const t = d({ me: { field: ["BP09-069"], evolveDeck: ["BP09-070"], cemetery: VAMPIRES, ex: [BAT], playPoints: 3 }, opp: { field: ["V5"] } });
    t.evolve("BP09-069", { into: "BP09-070_back" }).play(BAT);
    expect([t.keywords("BP09-069"), t.stats("opp:V5"), t.pp()]).toEqual([["storm"], [5, 2], 0]);
  });

  it("071 Arcus — can't attack; start of your main phase, Necrocharge (10): a Ghost", () => {
    expect(d({ me: { field: ["BP09-071"] } }).attackTargets("BP09-071")).toEqual([]);
    const cemetery = Array.from({ length: 10 }, () => "V1");
    const t = d({ me: { field: ["BP09-071"], cemetery, deck: ["V3"] }, opp: { deck: ["V1"] } }).end().end();
    expect(t.field()).toEqual(["BP09-071", "BP01-T14"]);
    const nine = d({ me: { field: ["BP09-071"], cemetery: cemetery.slice(1), deck: ["V3"] }, opp: { deck: ["V1"] } }).end().end();
    expect(nine.field()).toEqual(["BP09-071"]);
  });

  it("072 / 073 Oldblood King — 2 Forest Bats with Rush and Assail; evolved: Bats +1 attack", () => {
    const t = d({ me: { hand: ["BP09-072"], playPoints: 4 } }).play("BP09-072");
    expect([t.field(), t.keywords(BAT)]).toEqual([["BP09-072", BAT, BAT], ["rush", "assail"]]);
    const evo = d({ me: { field: ["BP09-072", BAT], evolveDeck: ["BP09-073"] } }).evolve("BP09-072");
    expect([evo.stats(BAT), evo.keywords(BAT)]).toEqual([[2, 1], ["rush", "assail"]]);
  });

  it("074 Darkfeast Bat — 4 damage to an enemy follower and its leader; with Sanguine recover 3", () => {
    const t = d({ me: { hand: ["BP01-108", "BP09-074"], deck: ["V1"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP01-108").play("BP09-074");
    expect([t.stats("opp:V5"), t.leader("opp"), t.pp()]).toEqual([[5, 1], 16, 3]);
    expect(d({ me: { hand: ["BP09-074"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP09-074").pp()).toBe(0);
  });

  it("075 Gift for Bloodkin — 2 less with 5 Vampire cards in the cemetery; 2 Forest Bats, and a draw with a Vania follower there", () => {
    const t = d({ me: { hand: ["BP09-075"], cemetery: ["BP02-069", ...VAMPIRES.slice(1)], deck: ["V1"], playPoints: 0 } }).play("BP09-075");
    expect([t.field(), t.hand()]).toEqual([[BAT, BAT], ["V1"]]);
    expect(d({ me: { hand: ["BP09-075"], cemetery: VAMPIRES.slice(1), playPoints: 0 } }).canPlay("BP09-075")).toBe(false);
  });

  it("076 / 077 Big Soul Hunter — evolved: the opponent buries their highest-attack follower (they pick among ties)", () => {
    const t = d({ me: { field: ["BP09-076"], evolveDeck: ["BP09-077"] }, opp: { field: ["V5", "V3"] } }).evolve("BP09-076");
    expect(t.cemetery("opp")).toEqual(["V5"]);
    const tie = d({ me: { field: ["BP09-076"], evolveDeck: ["BP09-077"] }, opp: { field: ["V5", "V1", "V5"] } }).evolve("BP09-076").pick("opp:V5");
    expect(tie.field("opp")).toEqual(["V1", "V5"]);
  });

  it("078 Raven, Eventide Vampire — engage and bury a Forest Bat: 4 damage and a draw, or 2 to each enemy leader, leader +2 and a draw", () => {
    expect(d({ me: { field: ["BP09-078"] } }).canActivate("BP09-078")).toBe(false);
    const t = d({ me: { field: ["BP09-078", BAT], deck: ["V1"] }, opp: { field: ["V5"] } }).activate("BP09-078").choose("follower");
    expect([t.stats("opp:V5"), t.hand(), t.field()]).toEqual([[5, 1], ["V1"], ["BP09-078"]]);
    const face = d({ me: { field: ["BP09-078", BAT], deck: ["V1"] } }).activate("BP09-078");
    expect([face.leader("opp"), face.leader(), face.hand()]).toEqual([18, 22, ["V1"]]);
  });

  it("079 Blood Moon — searches a Beast follower; engage and bury it: 1 damage to each leader", () => {
    const t = d({ me: { hand: ["BP09-079"], deck: ["V1", "BP09-010"] } }).play("BP09-079").pick("BP09-010");
    expect(t.hand()).toEqual(["BP09-010"]);
    t.activate("BP09-079");
    expect([t.leader(), t.leader("opp"), t.cemetery()]).toEqual([19, 19, ["BP09-079"]]);
  });

  it("080 / 081 Orator of the Bones — evolved: an Abysscraft follower from your cemetery to your hand", () => {
    const t = d({ me: { field: ["BP09-080"], evolveDeck: ["BP09-081"], cemetery: ["BP01-109", "V1"] } }).evolve("BP09-080");
    expect([t.hand(), t.cemetery()]).toEqual([["BP01-109"], ["V1"]]);
  });

  it("082 / 083 Raven, Noontide and Midnight — a Forest Bat into the EX area; once on each of your turns a Bat entering gives leader +1 / 1 damage", () => {
    const noon = d({ me: { hand: ["BP09-082"], ex: [BAT] } }).play("BP09-082").play(BAT).play(BAT);
    expect([noon.leader(), noon.field()]).toEqual([21, ["BP09-082", BAT, BAT]]);
    const night = d({ me: { hand: ["BP09-083"], ex: [BAT] } }).play("BP09-083").play(BAT).play(BAT);
    expect(night.leader("opp")).toBe(19);
  });

  it("084 Death the Nyctophile — Rush; Last Words: destroy an enemy follower and 3 damage to its leader", () => {
    const t = d({ me: { field: ["BP09-084"], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } }).play("QUICK-SAC");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 17]);
  });

  it("085 Poltergeist — Quick: bury the top 2 cards of your deck", () => {
    const t = d({ me: { hand: ["BP09-085"], deck: ["V1", "V3", "V5"] } }).play("BP09-085");
    expect([t.cemetery(), t.zone("me", "deck")]).toEqual([["V1", "V3", "BP09-085"], ["V5"]]);
  });
});
