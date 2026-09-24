import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP02 Abysscraft (069–088; 070 / 077 / 082 are collab printings of 069 / 076 / 081).
// "V1".."V5" are vanilla test followers (cost N, V1 = 2/2, V2 = 2/3, V3 = 3/4, V5 = 5/5).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const BAT = "BP01-T15"; // Forest Bat 1/1
const GHOST = "BP01-T14";
const TEN = Array<string>(10).fill("V1");

describe("BP02 Abysscraft", () => {
  it("069 Vania — +X/+X for the Forest Bats on your field; act: bury a Forest Bat for 3 damage and 1 to its leader", () => {
    expect(d({ me: { hand: ["BP02-069"], field: [BAT, BAT], playPoints: 2 } }).play("BP02-069").stats("BP02-069")).toEqual([4, 4]);
    const act = d({ me: { field: ["BP02-069", BAT], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP02-069");
    expect([act.field(), act.stats("opp:V5"), act.leader("opp")]).toEqual([["BP02-069"], [5, 2], 19]);
  });

  it("070 La+ Darkness — a collab printing of Vania: the same card (CR 2.13)", () => {
    const t = d({ me: { hand: ["BP02-070"], field: [BAT], playPoints: 2 } }).play("BP02-070");
    const vania = t.id("BP02-069");
    expect([t.field(), t.game.state.cards[vania]!.printing, t.stats("BP02-069")]).toEqual([[BAT, "BP02-069"], "BP02-070", [3, 3]]);
  });

  it("071 / 072 Soul Dealer — Ward; 3 damage to your leader; evolved destroys an enemy follower and gains its attack", () => {
    expect(d({ me: { hand: ["BP02-071"], playPoints: 4 } }).play("BP02-071").none().leader()).toBe(17);
    const evo = d({ me: { field: ["BP02-071"], evolveDeck: ["BP02-072"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP02-071");
    expect([evo.field("opp"), evo.leader()]).toEqual([[], 25]);
  });

  it("073 Khawy — Ward; Last Words: destroy an enemy follower and gain its attack", () => {
    const t = d({ me: { field: [{ card: "BP02-073", damage: 4 }] }, opp: { field: [{ card: "V1", engaged: true }, "V5"] } });
    t.attack("BP02-073", "opp:V1");
    expect([t.field("opp"), t.leader()]).toEqual([[], 25]);
  });

  it("074 / 075 Azazel — 3 less with Necrocharge (10); the opponent discards a random card; evolved: enemy leader defense becomes 10", () => {
    expect(d({ me: { hand: ["BP02-074"], cemetery: TEN, playPoints: 4 } }).canPlay("BP02-074")).toBe(true);
    expect(d({ me: { hand: ["BP02-074"], playPoints: 4 } }).canPlay("BP02-074")).toBe(false);
    const t = d({ me: { hand: ["BP02-074"], playPoints: 7 }, opp: { hand: ["V1", "V2", "V3"] } }).play("BP02-074");
    expect([t.hand("opp").length, t.cemetery("opp").length, t.keywords("BP02-074")]).toEqual([2, 1, ["bane"]]);
    const down = d({ me: { field: ["BP02-074"], evolveDeck: ["BP02-075"], playPoints: 1 } }).evolve("BP02-074");
    const up = d({ me: { field: ["BP02-074"], evolveDeck: ["BP02-075"], playPoints: 1 }, opp: { leaderDefense: 4 } }).evolve("BP02-074");
    expect([down.leader("opp"), up.leader("opp")]).toEqual([10, 10]);
  });

  it("076 Vampiric Fortress — may take a Vampire card from the top 3; act: 1 PP, engage, bury: a Forest Bat", () => {
    const t = d({ me: { hand: ["BP02-076"], deck: ["V1", "BP02-069", "V2", "V3"], playPoints: 1 } }).play("BP02-076").pick("BP02-069").order();
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["BP02-069"], ["V3", "V1", "V2"]]);
    const act = d({ me: { field: ["BP02-076"], playPoints: 1 } }).activate("BP02-076");
    expect([act.field(), act.cemetery()]).toEqual([[BAT], ["BP02-076"]]);
  });

  it("078 / 079 Veight — Strike: a Forest Bat; evolved: one into EX too", () => {
    expect(d({ me: { field: ["BP02-078"] } }).attack("BP02-078", "opp:leader").field()).toEqual(["BP02-078", BAT]);
    const evo = d({ me: { field: ["BP02-078"], evolveDeck: ["BP02-079"], playPoints: 1 } }).evolve("BP02-078");
    expect(evo.ex()).toEqual([BAT]);
    expect(evo.attack("BP02-078", "opp:leader").field()).toEqual(["BP02-078", BAT]);
  });

  it("080 Trick Dullahan — a Ghost into EX, 3 with Necrocharge (10)", () => {
    expect(d({ me: { hand: ["BP02-080"], playPoints: 2 } }).play("BP02-080").ex()).toEqual([GHOST]);
    expect(d({ me: { hand: ["BP02-080"], cemetery: TEN, playPoints: 2 } }).play("BP02-080").ex()).toEqual([GHOST, GHOST, GHOST]);
  });

  it("081 Precious Bloodfangs — X Forest Bats (enemy cards on the field) or +1/+1 to each of your Forest Bats", () => {
    const bats = d({ me: { hand: ["BP02-081"], playPoints: 2 }, opp: { field: ["V1", "V2", "AMULET"] } }).play("BP02-081").choose("1");
    expect(bats.field()).toEqual([BAT, BAT, BAT]);
    const buff = d({ me: { hand: ["BP02-081"], field: [BAT, BAT], playPoints: 2 } }).play("BP02-081").choose("2");
    expect(buff.game.state.players[0].zones.field.map((id) => buff.game.reader().info(id).attack)).toEqual([2, 2]);
  });

  it("083 Mini Soul Devil — 2 damage to the enemy leader whenever one of your followers evolves", () => {
    const t = d({ me: { field: ["BP02-083", "EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2 } }).evolve("EVOLVER");
    expect(t.leader("opp")).toBe(18);
  });

  it("084 Moriana — with Sanguine: leader +3 and draw", () => {
    const t = d({ me: { hand: ["BP02-071", "BP02-084"], deck: ["V1"], playPoints: 7 } }).play("BP02-071").none().play("BP02-084");
    expect([t.leader(), t.hand()]).toEqual([20, ["V1"]]);
    const no = d({ me: { hand: ["BP02-084"], deck: ["V1"], playPoints: 3 } }).play("BP02-084");
    expect([no.leader(), no.hand()]).toEqual([20, []]);
  });

  it("085 / 086 Demonic Hedonist — at your end phase with Sanguine: draw then discard; evolved Strike: 1 to each leader", () => {
    const t = d({ me: { field: ["BP02-085"], hand: ["BP02-071"], deck: ["V1"], playPoints: 4 }, opp: { deck: ["V1"] } });
    t.play("BP02-071").none().end();
    expect([t.hand(), t.cemetery()]).toEqual([[], ["V1"]]); // drew V1, then discarded it
    const none = d({ me: { field: ["BP02-085"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect(none.zone("me", "deck")).toEqual(["V1"]);
    const strike = d({ me: { field: [{ card: "BP02-085", evolvedInto: "BP02-086" }] } }).attack("BP02-085", "opp:leader");
    expect([strike.leader(), strike.leader("opp")]).toEqual([19, 16]);
  });

  it("087 Bone Chimera — Necrocharge (7): Rush and Bane (only while it holds); fanfare mills 3", () => {
    const t = d({ me: { hand: ["BP02-087"], deck: ["V1", "V1", "V1"], cemetery: ["V1", "V1", "V1", "V1"], playPoints: 3 } }).play("BP02-087");
    expect([t.cemetery().length, t.keywords("BP02-087")]).toEqual([7, ["rush", "bane"]]);
    const six = d({ me: { hand: ["BP02-087"], deck: ["V1", "V1", "V1"], cemetery: ["V1", "V1", "V1"], playPoints: 3 } }).play("BP02-087");
    expect(six.keywords("BP02-087")).toEqual([]);
  });

  it("088 Necrocarnival — choose one; up to 2 with Necrocharge (10)", () => {
    const one = d({ me: { hand: ["BP02-088"], cemetery: ["V2", "V3"], playPoints: 3 } }).play("BP02-088").choose("1");
    expect(one.field()).toEqual(["V2"]);
    const two = d({ me: { hand: ["BP02-088"], cemetery: TEN, playPoints: 3 } }).play("BP02-088").choose("1", "2").pick("V1");
    expect(two.field()).toEqual(["V1", GHOST, GHOST]);
    expect(() => d({ me: { hand: ["BP02-088"], cemetery: ["V2"], playPoints: 3 } }).play("BP02-088").choose("1", "2")).toThrow();
  });
});
