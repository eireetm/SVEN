import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP01 Runecraft (019–027), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot (evolve deck) is what serving
// ({[feed]}) uses; faceup ones are used Carrots. Umamusume followers without Fanfare: CP01-061 Curren Chan (1c 1/1), CP01-023
// Narita Taishin (2c 3/2, BNW), CP01-022 Sirius Symboli (4c 4/4). CP01-021 / 034 / 047 are 1-cost Umamusume spells.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";
const TEN = Array<string>(10).fill("CP01-061");
const SPELLS = ["CP01-021", "CP01-034", "CP01-047", "CP01-021", "CP01-034"];

describe("ECP01 Runecraft", () => {
  it("019 / 020 Cheval Grand — Fanfare: a faceup Carrot facedown with 10 Umamusume cards in the cemetery; evolved: 2 (4) damage", () => {
    const t = d({ me: { hand: ["ECP01-019"], faceUpEvolveDeck: [CARROT], cemetery: TEN, playPoints: 2 } }).play("ECP01-019");
    expect([t.game.reader().faceUpEvolveDeck(0).length, t.game.reader().carrotsToServe(0).length]).toEqual([0, 1]);
    const n = d({ me: { hand: ["ECP01-019"], faceUpEvolveDeck: [CARROT], playPoints: 2 } }).play("ECP01-019");
    expect(n.game.reader().faceUpEvolveDeck(0).length).toBe(1);
    const e = d({ me: { field: ["ECP01-019"], evolveDeck: ["ECP01-020"], cemetery: TEN, playPoints: 1 }, opp: { field: ["V5"] } }).evolve("ECP01-019");
    expect(e.stats("opp:V5")).toEqual([5, 1]);
  });

  it("020 Cheval Grand — an enemy follower damaged by an Umamusume card this turn goes to the cemetery: draw, then discard (twice a turn)", () => {
    const t = d({ me: { field: ["ECP01-019"], evolveDeck: ["ECP01-020"], hand: ["KILL", "KILL", "KILL"], deck: ["V1", "V3", "V5"], playPoints: 4 }, opp: { field: ["V5", "V3", "V1"] } });
    t.evolve("ECP01-019").pick("opp:V5");
    // Destroyed by another card later: it triggers (ruling).
    t.play("KILL").pick("opp:V5").pick("V1");
    expect([t.hand(), t.cemetery()]).toEqual([["KILL", "KILL"], ["KILL", "V1"]]);
    // Not damaged this turn by an Umamusume card: no trigger.
    t.play("KILL").pick("opp:V3");
    expect(t.hand()).toEqual(["KILL"]);
  });

  it("021 Tanino Gimlet — Fanfare: a Vodka and a 1-cost Umamusume spell from the deck; On Race: 4 damage to up to 1, +1/+1", () => {
    const t = d({ me: { hand: ["ECP01-021"], deck: ["V1", "CP01-030", "CP01-021"], playPoints: 4 } }).play("ECP01-021").pick("CP01-030").pick("CP01-021");
    expect(t.hand().sort()).toEqual(["CP01-021", "CP01-030"]);
    const r = d({ me: { field: ["ECP01-021"], evolveDeck: [CARROT], playPoints: 1 }, opp: { field: ["V5"] } }).activate("ECP01-021").pick("opp:V5");
    expect([r.stats("opp:V5"), r.stats("ECP01-021")]).toEqual([[5, 1], [4, 4]]);
  });

  it("022 Narita Top Road — Strike, banish 3 Umamusume followers with Storm from the cemetery: its attack to each enemy follower", () => {
    const t = d({ me: { field: ["ECP01-022"], cemetery: ["CP01-001", "ECP01-007", "ECP01-015", "ECP01-043"] }, opp: { field: ["V5", "V3"] } });
    t.attack("ECP01-022", "opp:leader").yes();
    // Air Shakur has no Storm in the cemetery (ruling).
    expect([t.stats("opp:V5"), t.field("opp"), t.cemetery(), t.leader("opp")]).toEqual([[5, 1], ["V5"], ["ECP01-043"], 16]);
  });

  it("023 Verxina — Ward; Fanfare, discard an Umamusume card: 2 damage to the enemy leader, leader +2, draw 2; Cheval Grand or Vivlos enters: 2 damage", () => {
    const t = d({ me: { hand: ["ECP01-023", "CP01-061"], deck: ["V1", "V3"], playPoints: 4 } }).play("ECP01-023").none().yes();
    expect([t.leader("opp"), t.leader(), t.hand()]).toEqual([18, 22, ["V1", "V3"]]);
    const v = d({ me: { field: ["ECP01-023"], hand: ["ECP01-024"], playPoints: 3 }, opp: { field: ["V3"] } }).play("ECP01-024");
    expect([v.stats("opp:V3"), v.pp()]).toEqual([[3, 2], 2]);
  });

  it("024 Vivlos — costs 2 less with a Cheval Grand or Verxina on your field; Rush, Assail", () => {
    expect(d({ me: { hand: ["ECP01-024"], field: ["ECP01-019"], playPoints: 1 } }).canPlay("ECP01-024")).toBe(true);
    expect(d({ me: { hand: ["ECP01-024"], playPoints: 2 } }).canPlay("ECP01-024")).toBe(false);
  });

  it("025 Daitaku Helios — Fanfare: 1 damage, 3 with an Umamusume card costing 4 or more on your field", () => {
    expect(d({ me: { hand: ["ECP01-025"], playPoints: 2 }, opp: { field: ["V5"] } }).play("ECP01-025").stats("opp:V5")).toEqual([5, 4]);
    expect(d({ me: { hand: ["ECP01-025"], field: ["CP01-022"], playPoints: 2 }, opp: { field: ["V5"] } }).play("ECP01-025").stats("opp:V5")).toEqual([5, 2]);
  });

  it("026 Sweep Tosho — 2 less with 5 Umamusume spells in the cemetery; Fanfare: a 1-cost one into the EX area, 1 less this turn", () => {
    const t = d({ me: { hand: ["ECP01-026"], cemetery: SPELLS, playPoints: 0 } }).play("ECP01-026").pick("CP01-047");
    expect([t.ex(), t.canPlay("CP01-047")]).toEqual([["CP01-047"], true]);
  });

  it("027 Lucky Star in the Sky — Quick; may take the top card if Umamusume; leader +2 with 5 Umamusume spells in the cemetery", () => {
    const t = d({ me: { hand: ["ECP01-027"], deck: ["CP01-061"], cemetery: SPELLS, playPoints: 1 } }).play("ECP01-027").pick("CP01-061");
    expect([t.hand(), t.leader()]).toEqual([["CP01-061"], 22]);
  });
});
