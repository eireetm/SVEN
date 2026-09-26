import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP14 Abysscraft (070–087, T05). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC destroys
// one of your followers. BP14-074 Anisage is a 2-cost Festive Abysscraft follower. Tokens: BP14-T05 Wolfling's
// Struggle.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP14 Abysscraft", () => {
  it("070 / 071 Itsurugi — Fanfare: a Wolfling's Struggle; {adv} (4), banish it: Itsurugi, Paradise's End, whose Fanfare deals 5 to one and 2 to up to 2 others, and each enemy follower to the cemetery on your turn: 1 to its leader, leader +1", () => {
    expect(d({ me: { hand: ["BP14-070"], playPoints: 2 } }).play("BP14-070").ex()).toEqual(["BP14-T05"]);
    const t = d({ me: { field: ["BP14-070"], evolveDeck: ["BP14-071"], cemetery: n(5, "BP14-074"), playPoints: 4 }, opp: { field: ["V5", "V3", "V1"] } });
    t.activate("BP14-070").pick("BP14-071").pick("opp:V5", "opp:V3", "opp:V1").pick("opp:V5").flush();
    expect([t.field(), t.zone("me", "banished"), t.field("opp"), t.stats("opp:V3"), t.leader("opp"), t.leader()]).toEqual([
      ["BP14-071"],
      ["BP14-070"],
      ["V3"],
      [3, 2],
      18,
      22,
    ]);
    expect(d({ me: { field: ["BP14-070"], evolveDeck: ["BP14-071"], cemetery: n(9, "BP14-082"), playPoints: 4 } }).canActivate("BP14-070")).toBe(false);
  });

  it("072 / 073 Paracelise — evolves only with an empty hand; Fanfare: the top card into the EX area, discard; evolved: 5 and 2 to its leader, leader +2, the top card into the EX area", () => {
    const t = d({ me: { hand: ["BP14-072", "V1"], deck: ["V3"], playPoints: 3 } }).play("BP14-072");
    expect([t.ex(), t.cemetery(), t.hand()]).toEqual([["V3"], ["V1"], []]);
    expect(d({ me: { field: ["BP14-072"], evolveDeck: ["BP14-073"], hand: ["V1"], playPoints: 1 } }).canEvolve("BP14-072")).toBe(false);
    const evo = d({ me: { field: ["BP14-072"], evolveDeck: ["BP14-073"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP14-072");
    expect([evo.field("opp"), evo.leader("opp"), evo.leader(), evo.ex()]).toEqual([[], 18, 22, ["V1"]]);
  });

  it("074 / 075 Anisage — discarded or banished from the hand: may go into the EX area; evolved: a Festive card from the top 4 into the EX area", () => {
    const t = d({ me: { hand: ["BP14-082", "BP14-074"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP14-082").yes();
    expect([t.ex(), t.cemetery()]).toEqual([["BP14-074"], []]);
    const banish = d({ me: { hand: ["BP14-077", "BP14-074"], deck: ["V1", "V2"], playPoints: 1 } }).play("BP14-077").yes();
    expect([banish.ex(), banish.zone("me", "banished")]).toEqual([["V1", "V2", "BP14-074"], []]);
    const evo = d({ me: { field: ["BP14-074"], evolveDeck: ["BP14-075"], deck: ["V1", "BP14-072", "V2", "V3"], playPoints: 1 } }).evolve("BP14-074").pick("BP14-072").order();
    expect(evo.ex()).toEqual(["BP14-072"]);
  });

  it("076 Frigid Necromancer — act, engage: summon a follower (8 or less) from the cemetery as a 1/1; Last Words: banish it", () => {
    const t = d({ me: { field: ["BP14-076"], cemetery: ["V5", "BP14-032"] } }).activate("BP14-076").pick("V5");
    expect([t.field(), t.stats("V5"), t.engaged("BP14-076")]).toEqual([["BP14-076", "V5"], [1, 1], true]);
    expect(d({ me: { field: ["BP14-076"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").zone("me", "banished")).toEqual(["BP14-076"]);
  });

  it("077 Eternal Contract — 2 times: the top card into the EX area, banish a card from the hand; from the cemetery, (1): up to 3 Paracelise back into the deck and faceup ones facedown", () => {
    const t = d({ me: { hand: ["BP14-077", "V3", "V5"], deck: ["V1", "V2"], playPoints: 1 } }).play("BP14-077").pick("V3");
    expect([t.ex(), t.zone("me", "banished"), t.hand()]).toEqual([["V1", "V2"], ["V3", "V5"], []]);
    const act = d({ me: { cemetery: ["BP14-077", "BP14-072"], banished: ["BP14-072"], faceUpEvolveDeck: ["BP14-073"], deck: ["V1"], playPoints: 1 } });
    act.activate("BP14-077@cemetery").pick("BP14-072", "BP14-072").pick("BP14-073");
    expect([act.zone("me", "deck").sort(), act.zone("me", "banished"), act.game.state.cards[act.id("BP14-073")]!.faceUp]).toEqual([
      ["BP14-072", "BP14-072", "V1"],
      ["BP14-077"],
      false,
    ]);
  });

  it("078 / 079 Briared Vampire — evolved: the top card into the EX area, discard", () => {
    const t = d({ me: { field: ["BP14-078"], evolveDeck: ["BP14-079"], hand: ["V1"], deck: ["V3"], playPoints: 1 } }).evolve("BP14-078");
    expect([t.ex(), t.cemetery()]).toEqual([["V3"], ["V1"]]);
  });

  it("080 Room Service Demon — Fanfare: 3 damage; with 2 cards or less in hand recover 2; with 0, 2 to its leader too", () => {
    const t = d({ me: { hand: ["BP14-080"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP14-080");
    expect([t.stats("opp:V5"), t.pp(), t.leader("opp")]).toEqual([[5, 2], 2, 18]);
    const two = d({ me: { hand: ["BP14-080", "V1", "V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP14-080");
    expect([two.pp(), two.leader("opp")]).toEqual([2, 20]);
    expect(d({ me: { hand: ["BP14-080", ...n(3)], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP14-080").pp()).toBe(0);
  });

  it("081 Undying Resolve — discarded or banished from the hand: an Abysscraft follower gets Bane; a Festive follower (2 or less) from the cemetery, Anisage with +1 and Storm", () => {
    const t = d({ me: { hand: ["BP14-081"], cemetery: ["BP14-074"], playPoints: 2 } }).play("BP14-081");
    expect([t.field(), t.stats("BP14-074"), t.keywords("BP14-074")]).toEqual([["BP14-074"], [3, 2], ["storm"]]);
    const discard = d({ me: { hand: ["BP14-082", "BP14-081"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP14-082");
    expect(discard.keywords("BP14-082")).toEqual(["bane"]);
  });

  it("082 / 083 Silvernail Markswoman — Fanfare: 2 damage, discard; evolved: 4 to it and its leader, discard", () => {
    const t = d({ me: { field: ["BP14-082"], evolveDeck: ["BP14-083"], hand: ["V1"], playPoints: 5 }, opp: { field: ["V5"] } }).evolve("BP14-082");
    expect([t.stats("opp:V5"), t.leader("opp"), t.cemetery()]).toEqual([[5, 1], 16, ["V1"]]);
  });

  it("084 Parkour Werewolf — no ability damage; Strike: 2 to the enemy leader, leader +2; act (2): Storm", () => {
    const hit = d({ me: { hand: ["BP14-086"], playPoints: 2 }, opp: { field: ["BP14-084"] } }).play("BP14-086");
    expect([hit.stats("opp:BP14-084"), hit.leader()]).toEqual([[4, 4], 17]);
    const t = d({ me: { field: ["BP14-084"], playPoints: 2 }, opp: { deck: n(1) } }).attack("BP14-084", "opp:leader");
    expect([t.leader("opp"), t.leader()]).toEqual([14, 22]);
    expect(d({ me: { hand: ["BP14-084"], playPoints: 6 } }).play("BP14-084").activate("BP14-084").keywords("BP14-084")).toEqual(["storm"]);
  });

  it("085 Bat Usher — Fanfare: +1 attack with 2 cards or less in hand, Storm with 0", () => {
    const zero = d({ me: { hand: ["BP14-085"], playPoints: 1 } }).play("BP14-085");
    expect([zero.stats("BP14-085"), zero.keywords("BP14-085")]).toEqual([[3, 2], ["storm"]]);
    expect(d({ me: { hand: ["BP14-085", ...n(2)], playPoints: 1 } }).play("BP14-085").keywords("BP14-085")).toEqual([]);
    expect(d({ me: { hand: ["BP14-085", ...n(3)], playPoints: 1 } }).play("BP14-085").stats("BP14-085")).toEqual([2, 2]);
  });

  it("086 Creeping Malice — Quick; 5 damage and 3 to your leader", () => {
    const t = d({ me: { hand: ["BP14-086"], playPoints: 2 }, opp: { field: ["V5"] } });
    expect(t.keywords("BP14-086")).toEqual(["quick"]);
    expect(t.play("BP14-086").leader()).toBe(17);
  });

  it("087 Full Moon Leap — an Abysscraft follower +1 attack, Storm with an empty hand", () => {
    const t = d({ me: { hand: ["BP14-087"], field: ["BP14-074"], playPoints: 1 } }).play("BP14-087");
    expect([t.stats("BP14-074"), t.keywords("BP14-074")]).toEqual([[3, 2], ["storm"]]);
    expect(d({ me: { hand: ["BP14-087", "V1"], field: ["BP14-074"], playPoints: 1 } }).play("BP14-087").keywords("BP14-074")).toEqual([]);
    expect(d({ me: { hand: ["BP14-087"], field: ["V1"], playPoints: 1 } }).canPlay("BP14-087")).toBe(false);
  });

  it("T05 Wolfling's Struggle — 1 damage; may discard to bury the top card", () => {
    const t = d({ me: { ex: ["BP14-T05"], hand: ["V1"], deck: ["V3"] }, opp: { field: ["V5"] } }).play("BP14-T05@ex").pick("V1");
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 4], ["V1", "V3"]]);
    const keep = d({ me: { ex: ["BP14-T05"], hand: ["V1"], deck: ["V3"] }, opp: { field: ["V5"] } }).play("BP14-T05@ex").none();
    expect([keep.hand(), keep.cemetery()]).toEqual([["V1"], []]);
  });
});
