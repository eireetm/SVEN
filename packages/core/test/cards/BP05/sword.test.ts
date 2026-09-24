import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP05 Swordcraft (018–034). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5. BP01-T05 Knight and
// BP02-T02 Shield Guardian are 1/1 tokens.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const nine = (card: string) => Array<string>(9).fill(card);

describe("BP05 Swordcraft", () => {
  it("018 / 019 Octrice — mills 2; free evolve at 10 enemy cemetery cards; evolved takes one into your EX area, 2 less from there", () => {
    const t = d({ me: { hand: ["BP05-018"], evolveDeck: ["BP05-019"] }, opp: { deck: ["V2", "V3"], cemetery: nine("V1") } });
    t.play("BP05-018");
    expect(t.cemetery("opp")).toEqual([...nine("V1"), "V2", "V3"]);
    t.evolve("BP05-018").pick("opp:V3"); // the 0-cost evolve: 11 cards in the opponent's cemetery
    expect([t.pp(), t.ex()]).toEqual([1, ["V3"]]);
    t.play("V3"); // 3 - 2 with 10 cards left in the opponent's cemetery
    expect([t.pp(), t.field()]).toEqual([0, ["BP05-018", "V3"]]);
    const early = d({ me: { hand: ["BP05-018"], evolveDeck: ["BP05-019"] }, opp: { deck: ["V2", "V3"] } }).play("BP05-018");
    expect(early.canEvolve("BP05-018")).toBe(false);
  });

  it("020 Magna Legacy — banish the top half of the deck; 4 to each enemy, or 8 when 15+ were banished", () => {
    const t = d({ me: { hand: ["BP05-020"], deck: Array<string>(5).fill("V1"), playPoints: 8 }, opp: { field: ["V5"] } }).play("BP05-020");
    expect([t.zone("me", "banished").length, t.zone("me", "deck").length, t.leader("opp"), t.stats("opp:V5")]).toEqual([3, 2, 16, [5, 1]]);
    const big = d({ me: { hand: ["BP05-020"], deck: Array<string>(29).fill("V1"), playPoints: 8 }, opp: { field: ["V5"] } });
    big.play("BP05-020");
    expect([big.zone("me", "banished").length, big.leader("opp"), big.field("opp")]).toEqual([15, 12, []]);
  });

  it("021 / 022 Apostle of Usurpation — mill 2, then draw at 10; evolved: 4 damage", () => {
    const t = d({ me: { hand: ["BP05-021"], deck: ["V1"], playPoints: 4 }, opp: { deck: ["V1", "V1"], cemetery: nine("V1").slice(1) } });
    t.play("BP05-021");
    expect([t.cemetery("opp").length, t.hand()]).toEqual([10, ["V1"]]);
    const evo = d({ me: { field: ["BP05-021"], evolveDeck: ["BP05-022"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP05-021");
    expect(evo.stats("opp:V5")).toEqual([5, 1]);
  });

  it("023 Empyreal Swordsman — end phase: 4 to an enemy follower and 2 to its leader; nothing without one", () => {
    const t = d({ me: { field: ["BP05-023"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 18]);
    expect(d({ me: { field: ["BP05-023"] }, opp: { deck: ["V1"] } }).end().leader("opp")).toBe(20);
  });

  it("024 Confront Adversity — Shield Guardian and Knight; +3/+3 and recover 2 against an enemy follower costing 6+", () => {
    const t = d({ me: { hand: ["BP05-024"] }, opp: { field: ["BP05-030"] } }).play("BP05-024").none();
    expect([t.field(), t.stats("BP02-T02"), t.stats("BP01-T05"), t.pp()]).toEqual([["BP02-T02", "BP01-T05"], [4, 4], [4, 4], 3]);
    const small = d({ me: { hand: ["BP05-024"] }, opp: { field: ["V5"] } }).play("BP05-024").none();
    expect([small.stats("BP01-T05"), small.pp()]).toEqual([[1, 1], 1]);
  });

  it("025 Disciple of Usurpation — Storm; Strike: mill 1, then +2/+0 at 10", () => {
    const t = d({ me: { hand: ["BP05-025"] }, opp: { deck: ["V1"], cemetery: nine("V1") } }).play("BP05-025");
    t.attack("BP05-025", "opp:leader");
    expect([t.cemetery("opp").length, t.leader("opp")]).toEqual([10, 15]);
  });

  it("026 Fervent Machine Soldier — discard a Commander card to search one", () => {
    const t = d({ me: { hand: ["BP05-026", "BP05-023"], deck: ["V1", "BP05-030"] } }).play("BP05-026").yes().pick("BP05-030");
    expect([t.hand(), t.cemetery()]).toEqual([["BP05-030"], ["BP05-023"]]);
  });

  it("027 / 028 Geno — playing an amulet gives a follower +0/+1; evolved searches an amulet", () => {
    expect(d({ me: { field: ["BP05-027"], hand: ["AMULET"] } }).play("AMULET").stats("BP05-027")).toEqual([2, 3]);
    const evo = d({ me: { field: ["BP05-027"], evolveDeck: ["BP05-028"], deck: ["V1", "AMULET"], playPoints: 1 } });
    evo.evolve("BP05-027").pick("AMULET");
    expect(evo.hand()).toEqual(["AMULET"]);
  });

  it("029 Servant of Usurpation — mill 1; +1/+0 for each card milled from the opponent's deck on your turn", () => {
    const t = d({ me: { hand: ["BP05-029", "BP05-021"], playPoints: 5 }, opp: { deck: ["V1", "V1", "V1"] } }).play("BP05-029");
    expect(t.stats("BP05-029")).toEqual([2, 2]);
    t.play("BP05-021").flush(); // two cards milled: two triggers
    expect(t.stats("BP05-029")).toEqual([4, 2]);
  });

  it("030 / 031 Captain Meteo — 4 damage to an enemy leader; evolved destroys a follower", () => {
    expect(d({ me: { hand: ["BP05-030"], playPoints: 8 } }).play("BP05-030").leader("opp")).toBe(16);
    const evo = d({ me: { field: ["BP05-030"], evolveDeck: ["BP05-031"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP05-030");
    expect(evo.field("opp")).toEqual([]);
  });

  it("032 Gravikinetic Warrior — a token follower on your field gets +2/+2", () => {
    const t = d({ me: { hand: ["BP05-032"], field: ["BP01-T05", "V1"], playPoints: 4 } }).play("BP05-032");
    expect([t.stats("BP01-T05"), t.stats("V1")]).toEqual([[3, 3], [2, 2]]);
  });

  it("033 Usurping Spineblade — Quick; 3 damage and mill 1, then 2 more at 10", () => {
    const t = d({ me: { hand: ["BP05-033"] }, opp: { field: ["V5"], deck: ["V1"], cemetery: nine("V1") } }).play("BP05-033");
    expect(t.field("opp")).toEqual([]);
    const few = d({ me: { hand: ["BP05-033"] }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP05-033");
    expect(few.stats("opp:V5")).toEqual([5, 2]);
  });

  it("034 Avaritia — a Thief card from the top 4; returns to hand when it was Octrice", () => {
    const t = d({ me: { hand: ["BP05-034"], deck: ["V1", "BP05-018", "BP05-025", "V2"] } }).play("BP05-034").pick("BP05-018").order();
    expect([t.hand(), t.cemetery()]).toEqual([["BP05-018", "BP05-034"], []]);
    const other = d({ me: { hand: ["BP05-034"], deck: ["V1", "BP05-018", "BP05-025", "V2"] } }).play("BP05-034").pick("BP05-025").order();
    expect([other.hand(), other.cemetery()]).toEqual([["BP05-025"], ["BP05-034"]]);
  });
});
