import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP06 Abysscraft (073–089). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; QUICK-SAC destroys a
// follower of yours (0); BOTH-20 deals 20 to each leader. Yokai (妖怪): BP06-076, 080, 084, T03
// One-Tailed Fox; BP01-T15 Forest Bat is a token.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FOX = "BP06-T03";
const GINSETSU = { card: "BP06-073", evolvedInto: "BP06-074" };

describe("BP06 Abysscraft", () => {
  it("073 / 074 Ginsetsu — 5 One-Tailed Foxes into the EX area; evolved: Yokai cost 2 less, deal 1 more, +1/+0 when one leaves", () => {
    const t = d({ me: { hand: ["BP06-073"], ex: ["V1", "V1", "V1"], playPoints: 6 } }).play("BP06-073");
    expect(t.ex()).toEqual(["V1", "V1", "V1", FOX, FOX]); // as many as fit
    const evo = d({ me: { field: [GINSETSU], ex: [FOX], playPoints: 0 }, opp: { field: [{ card: "V5", engaged: true }] } });
    evo.play(FOX).none(); // costs 0; Ward: stay reserved
    evo.attack(FOX, "opp:V5"); // Rush; the fox deals 1 + 1 and dies
    expect([evo.stats("opp:V5"), evo.stats("BP06-073")]).toEqual([[5, 3], [2, 9]]);
  });

  it("075 Aragavy — pay 5: 5 damage to every other follower, +2/+2 and Storm; end phase with Sanguine: 3 damage", () => {
    const t = d({ me: { hand: ["BP06-075"], field: ["V3"], playPoints: 8 }, opp: { field: ["V5"] } }).play("BP06-075").yes();
    expect([t.field(), t.field("opp"), t.stats("BP06-075"), t.keywords("BP06-075")]).toEqual([["BP06-075"], [], [6, 5], ["storm"]]);
    const end = d({ me: { field: ["BP06-075"], hand: ["BOTH-20"], leaderDefense: 25 }, opp: { leaderDefense: 30, deck: ["V1"] } });
    end.play("BOTH-20").end();
    expect(end.leader("opp")).toBe(7);
  });

  it("076 / 077 Shuten-Doji — Bane; banish 2 Yokai cards from the cemetery to evolve; evolved: Storm, Storm to another Yokai", () => {
    const t = d({ me: { hand: ["BP06-076"], field: ["BP06-084"], cemetery: ["BP06-080", "BP06-080"], evolveDeck: ["BP06-077"] } });
    t.play("BP06-076").yes().yes();
    expect([t.zone("me", "banished").length, t.stats("BP06-076"), t.keywords("BP06-084"), t.keywords("BP06-076")]).toEqual([
      2,
      [2, 5],
      ["storm"],
      ["storm", "bane"],
    ]);
  });

  it("078 Bear Pelt Warrior — Rush; Strike: 1 to each leader; Last Words: leader +4", () => {
    const t = d({ me: { field: ["BP06-078"], hand: ["QUICK-SAC"] } }).attack("BP06-078", "opp:leader");
    expect([t.leader(), t.leader("opp")]).toEqual([19, 14]);
    t.play("QUICK-SAC");
    expect(t.leader()).toBe(23);
  });

  it("079 Yuzuki — Bane; the opponent buries a follower (2 with Necrocharge); from hand: pay 3 and discard it for 5 damage", () => {
    const t = d({ me: { hand: ["BP06-079"], playPoints: 6 }, opp: { field: ["V1", "V3"] } }).play("BP06-079").pick("opp:V3");
    expect(t.field("opp")).toEqual(["V1"]);
    const ten = d({ me: { hand: ["BP06-079"], cemetery: Array<string>(10).fill("V1"), playPoints: 6 }, opp: { field: ["V1", "V3", "V5"] } });
    ten.play("BP06-079").pick("opp:V1", "opp:V5");
    expect(ten.field("opp")).toEqual(["V3"]);
  });

  it("080 Kasha — 1 damage and bury your top card, or a Yokai follower not named Kasha back from the cemetery", () => {
    const t = d({ me: { hand: ["BP06-080"], deck: ["V1"] }, opp: { field: ["V1"] } }).play("BP06-080");
    expect([t.stats("opp:V1"), t.cemetery()]).toEqual([[2, 1], ["V1"]]);
    const back = d({ me: { hand: ["BP06-080"], cemetery: ["BP06-080", "BP06-084"] } }).play("BP06-080");
    expect(back.hand()).toEqual(["BP06-084"]);
  });

  it("081 / 082 Cougar Pelt Warrior — evolved: another one from the deck onto the field engaged", () => {
    const t = d({ me: { field: ["BP06-081"], evolveDeck: ["BP06-082"], deck: ["V1", "BP06-081"], playPoints: 1 } }).evolve("BP06-081").pick("BP06-081");
    expect([t.field(), t.game.state.players[0].zones.field.map((id) => t.game.state.cards[id]!.engaged)]).toEqual([
      ["BP06-081", "BP06-081"],
      [false, true],
    ]);
  });

  it("083 Unleash the Nightmare — 1 less with a Vampire card on your field; 3 Forest Bats and draw 2", () => {
    const t = d({ me: { hand: ["BP06-083"], field: ["BP06-087"], deck: ["V1", "V2"] } }).play("BP06-083");
    expect([t.field(), t.hand(), t.pp()]).toEqual([["BP06-087", "BP01-T15", "BP01-T15", "BP01-T15"], ["V1", "V2"], 0]);
  });

  it("084 / 085 Zashiki-Warashi — evolved: discard a Yokai card for leader +1 and 2 cards", () => {
    const t = d({ me: { field: ["BP06-084"], evolveDeck: ["BP06-085"], hand: ["BP06-080"], deck: ["V1", "V2"], playPoints: 1 } });
    t.evolve("BP06-084").yes();
    expect([t.leader(), t.hand(), t.cemetery()]).toEqual([21, ["V1", "V2"], ["BP06-080"]]);
  });

  it("086 Antelope Pelt Warrior — 1 damage to your leader at the start of your main phase", () => {
    const t = d({ me: { field: ["BP06-086"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end().end();
    expect(t.leader()).toBe(19);
  });

  it("087 Rookie Succubus — Fanfare and Last Words: a Forest Bat", () => {
    const t = d({ me: { hand: ["BP06-087", "QUICK-SAC"] } }).play("BP06-087");
    expect(t.field()).toEqual(["BP06-087", "BP01-T15"]);
    t.play("QUICK-SAC").pick("BP06-087");
    expect(t.field()).toEqual(["BP01-T15", "BP01-T15"]);
  });

  it("088 Demonic Procession — a Yokai follower from the top 5", () => {
    const t = d({ me: { hand: ["BP06-088"], deck: ["V1", "BP06-084", "V2"] } }).play("BP06-088").pick("BP06-084").order();
    expect(t.hand()).toEqual(["BP06-084"]);
  });

  it("089 Berserker's Pelt — once on your turn, when your leader loses defense: +1/+1; engage and bury it at 10 or less: leader +2", () => {
    const t = d({ me: { field: ["BP06-089", "V1"], hand: ["BOTH-20", "BOTH-20"], leaderDefense: 50 }, opp: { leaderDefense: 50 } });
    t.play("BOTH-20");
    expect(t.stats("V1")).toEqual([3, 3]);
    t.play("BOTH-20"); // once per turn
    expect(t.stats("V1")).toEqual([3, 3]);
    expect(d({ me: { field: ["BP06-089"] } }).canActivate("BP06-089")).toBe(false);
    const low = d({ me: { field: ["BP06-089"], leaderDefense: 10 } }).activate("BP06-089");
    expect([low.leader(), low.cemetery()]).toEqual([12, ["BP06-089"]]);
  });
});
