import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP06 Swordcraft (018–034). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; KILL destroys an enemy
// follower (1). BP06-021/025/027/029 are Swordcraft followers costing 1/3/2/2.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP06 Swordcraft", () => {
  it("018 Kagemitsu — Rush; +X/+X for faceup evolved followers in your evolve deck, Assail at 3", () => {
    const t = d({ me: { hand: ["BP06-018"], faceUpEvolveDeck: ["BP06-002", "BP06-002", "BP06-002"] } }).play("BP06-018");
    expect([t.stats("BP06-018"), t.keywords("BP06-018")]).toEqual([[4, 4], ["rush", "assail"]]);
    expect(d({ me: { hand: ["BP06-018"] } }).play("BP06-018").stats("BP06-018")).toEqual([1, 1]);
  });

  it("019 / 020 Ralmia — Rush; evolve costs 1 less per other follower; evolved: Storm, pay 3 for +1/+1 per other follower", () => {
    const t = d({ me: { field: ["BP06-019", "V1", "V1"], evolveDeck: ["BP06-020"], playPoints: 4 } }).evolve("BP06-019").yes();
    expect([t.pp(), t.stats("BP06-019"), t.keywords("BP06-019")]).toEqual([0, [6, 5], ["storm"]]);
  });

  it("021 Steadfast Samurai — takes no combat damage; pay 2: +1/+1 and Rush", () => {
    const t = d({ me: { field: ["BP06-021"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP06-021", "opp:V5");
    expect([t.stats("BP06-021"), t.stats("opp:V5")]).toEqual([[1, 1], [5, 4]]);
    t.activate("BP06-021");
    expect([t.stats("BP06-021"), t.keywords("BP06-021"), t.pp()]).toEqual([[2, 2], ["rush"], 1]);
  });

  it("022 / 023 Hero of Antiquity — Rush, Aura, can't be destroyed or banished by abilities; evolved destroys, or banishes a 6+ cost", () => {
    expect(d({ me: { hand: ["BP06-022"], playPoints: 7 } }).play("BP06-022").keywords("BP06-022")).toEqual(["rush", "aura"]);
    const big = d({ me: { field: ["BP06-022"], evolveDeck: ["BP06-023"], playPoints: 1 }, opp: { field: ["BP05-020"] } }).evolve("BP06-022");
    expect(big.zone("opp", "banished")).toEqual(["BP05-020"]);
    const small = d({ me: { field: ["BP06-022"], evolveDeck: ["BP06-023"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP06-022");
    expect(small.cemetery("opp")).toEqual(["V5"]);
  });

  it("024 Courtly Dance — summon Swordcraft followers costing 3 or less from the top 5, up to a total cost of 7", () => {
    const deck = ["BP06-025", "BP06-027", "BP06-021", "BP06-029", "V1", "V2"];
    const t = d({ me: { hand: ["BP06-024"], deck, playPoints: 6 } }).play("BP06-024");
    t.pick("BP06-025").pick("BP06-027").pick("BP06-029").order();
    // 3 + 2 + 2 = 7: the 1-cost one no longer fits.
    expect([t.field(), t.zone("me", "deck")]).toEqual([["BP06-025", "BP06-027", "BP06-029"], ["V2", "BP06-021", "V1"]]);
  });

  it("025 / 026 Quickdraw Maven — evolved: discard a card for 5 damage", () => {
    const t = d({ me: { field: ["BP06-025"], evolveDeck: ["BP06-026"], hand: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("BP06-025").yes();
    expect([t.field("opp"), t.cemetery()]).toEqual([[], ["V1"]]);
  });

  it("027 Twinsword Master — Strike: refresh, once per turn", () => {
    // ZERO is 0/3: Twinsword Master (1/3) survives both fights.
    const t = d({ me: { field: ["BP06-027"] }, opp: { field: [{ card: "ZERO", engaged: true }, { card: "ZERO", engaged: true }] } });
    t.attack("BP06-027", "opp:ZERO");
    expect(t.engaged("BP06-027")).toBe(false);
    t.attack("BP06-027", "opp:ZERO");
    expect(t.engaged("BP06-027")).toBe(true);
  });

  it("028 Grand Acquisition — Quick; each opponent buries the top 3 cards of their deck", () => {
    const t = d({ me: { hand: ["BP06-028"] }, opp: { deck: ["V1", "V2", "V3", "V5"] } }).play("BP06-028");
    expect([t.cemetery("opp"), t.zone("opp", "deck")]).toEqual([["V1", "V2", "V3"], ["V5"]]);
  });

  it("029 / 030 Samurai Outlaw — evolve for 4 into a 6/5", () => {
    const t = d({ me: { field: ["BP06-029"], evolveDeck: ["BP06-030"], playPoints: 4 } }).evolve("BP06-029");
    expect(t.stats("BP06-029")).toEqual([6, 5]);
  });

  it("031 Adept Thief — mill the opponent 1, or draw then discard", () => {
    const t = d({ me: { hand: ["BP06-031"] }, opp: { deck: ["V1", "V2"] } }).play("BP06-031").choose("mill");
    expect(t.cemetery("opp")).toEqual(["V1"]);
    const loot = d({ me: { hand: ["BP06-031", "V3"], deck: ["V1"] } }).play("BP06-031").choose("loot").pick("V3");
    expect([loot.hand(), loot.cemetery()]).toEqual([["V1"], ["V3"]]);
  });

  it("032 Petalwink Paladin — destroy an enemy follower and draw; nothing without a target", () => {
    const t = d({ me: { hand: ["BP06-032"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP06-032");
    expect([t.field("opp"), t.hand()]).toEqual([[], ["V1"]]);
    expect(d({ me: { hand: ["BP06-032"], deck: ["V1"], playPoints: 6 } }).play("BP06-032").hand()).toEqual([]);
  });

  it("033 Levin Scholar — search a Levin follower", () => {
    const t = d({ me: { hand: ["BP06-033"], deck: ["V1", "BP06-033"] } }).play("BP06-033").pick("BP06-033");
    expect(t.hand()).toEqual(["BP06-033"]);
  });

  it("034 Breakneck Draw — engage a Swordcraft follower of yours: destroy an enemy follower", () => {
    const t = d({ me: { hand: ["BP06-034"], field: ["BP06-025"] }, opp: { field: ["V5"] } }).play("BP06-034").yes();
    expect([t.field("opp"), t.engaged("BP06-025")]).toEqual([[], true]);
    const none = d({ me: { hand: ["BP06-034"], field: ["V1"] }, opp: { field: ["V5"] } }).play("BP06-034");
    expect(none.field("opp")).toEqual(["V5"]);
  });
});
