import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP01 Swordcraft (010–018), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot (evolve deck) is what serving
// ({[feed]}) uses; faceup ones are used Carrots. Umamusume followers without Fanfare: CP01-061 Curren Chan (1c 1/1), CP01-023
// Narita Taishin (2c 3/2, BNW), CP01-022 Sirius Symboli (4c 4/4). CP01-021 / 034 / 047 are 1-cost Umamusume spells.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("ECP01 Swordcraft", () => {
  it("010 / 011 Gentildonna — opponents' Fanfare and On Evolve abilities don't trigger; evolved: 7 damage to each other follower", () => {
    expect(d({ me: { hand: ["FAN-DRAW"], deck: ["V1"], playPoints: 1 }, opp: { field: ["ECP01-010"] } }).play("FAN-DRAW").hand()).toEqual([]);
    const ev = d({ me: { field: ["EVOLVER"], evolveDeck: ["EVOLVER-E2"], deck: ["V1"], playPoints: 2 }, opp: { field: ["ECP01-010"] } });
    expect(ev.evolve("EVOLVER").hand()).toEqual([]);
    // Its controller's own abilities trigger.
    expect(d({ me: { hand: ["FAN-DRAW"], field: ["ECP01-010"], deck: ["V1"], playPoints: 1 } }).play("FAN-DRAW").hand()).toEqual(["V1"]);
    const e = d({ me: { field: ["ECP01-010", "V5"], evolveDeck: ["ECP01-011"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("ECP01-010");
    expect([e.field(), e.field("opp"), e.stats("ECP01-010")]).toEqual([["ECP01-010"], [], [7, 7]]);
  });

  it("012 Symboli Rudolf — On Race: +1/+1, may summon an Umamusume follower costing 3 or less from the top 3", () => {
    const t = d({ me: { field: ["ECP01-012"], evolveDeck: [CARROT], deck: ["V1", "CP01-023", "V3"], playPoints: 1 } });
    t.activate("ECP01-012").pick("CP01-023").order();
    expect([t.stats("ECP01-012"), t.field()]).toEqual([[4, 4], ["ECP01-012", "CP01-023"]]);
  });

  it("013 Sirius Symboli — Storm, Intimidate; Fanfare with 3 Umamusume cards: +0/+1 and Strike: draw, then discard", () => {
    const t = d({ me: { hand: ["ECP01-013"], field: ["CP01-061", "CP01-061"], deck: ["V1", "V3"], playPoints: 2 } }).play("ECP01-013");
    expect([t.stats("ECP01-013"), t.keywords("ECP01-013")]).toEqual([[2, 3], ["storm", "intimidate"]]);
    t.attack("ECP01-013", "opp:leader");
    expect([t.hand(), t.cemetery()]).toEqual([[], ["V1"]]);
    expect(d({ me: { hand: ["ECP01-013"], field: ["CP01-061"], playPoints: 2 } }).play("ECP01-013").stats("ECP01-013")).toEqual([2, 2]);
  });

  it("014 Aston Machan — On Race: 4 damage to up to 1 enemy follower, +1/+1, 2 damage to itself", () => {
    const t = d({ me: { field: ["ECP01-014"], evolveDeck: [CARROT], playPoints: 1 }, opp: { field: ["V5"] } }).activate("ECP01-014").pick("opp:V5");
    expect([t.stats("opp:V5"), t.field(), t.game.reader().faceUpEvolveDeck(0).length]).toEqual([[5, 1], [], 1]);
  });

  it("015 Symboli Kris S — Storm; act, engage 4 other Umamusume cards: +5/+0", () => {
    const t = d({ me: { field: ["ECP01-015", "CP01-061", "CP01-061", "CP01-023", "CP01-022"] } }).activate("ECP01-015");
    expect([t.stats("ECP01-015"), t.engaged("CP01-022"), t.engaged("ECP01-015")]).toEqual([[8, 3], true, false]);
    expect(d({ me: { field: ["ECP01-015", "CP01-061", "CP01-061", "CP01-023"] } }).canActivate("ECP01-015")).toBe(false);
  });

  it("016 Tap Dance City — Fanfare: a 1-cost Umamusume follower from the deck onto the field", () => {
    expect(d({ me: { hand: ["ECP01-016"], deck: ["V1", "CP01-061"], playPoints: 3 } }).play("ECP01-016").pick("CP01-061").field()).toEqual(["ECP01-016", "CP01-061"]);
  });

  it("017 Biwa Hayahide — On Race: +1/+1, up to 3 BNW cards with different names into the EX area, 3 less this turn", () => {
    const t = d({ me: { field: ["ECP01-017"], evolveDeck: [CARROT], deck: ["CP01-023", "CP01-021", "CP01-023", "V1"], playPoints: 1 } });
    t.activate("ECP01-017").pick("CP01-023").pick("CP01-021");
    expect([t.stats("ECP01-017"), t.ex(), t.canPlay("CP01-023"), t.pp()]).toEqual([[5, 5], ["CP01-023", "CP01-021"], true, 0]);
  });

  it("018 Teio-Oo-Oo!!! — an Umamusume follower costing 5 or less from the top 7; after a Tokai Teio, one costing 4 or less", () => {
    const t = d({ me: { hand: ["ECP01-018"], deck: ["CP01-014", "V1", "CP01-061"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("ECP01-018").pick("CP01-014").order().pick("CP01-061");
    // Tokai Teio's Fanfare: 2 damage per follower on your field.
    expect([t.field(), t.stats("opp:V5")]).toEqual([["CP01-014", "CP01-061"], [5, 1]]);
    const n = d({ me: { hand: ["ECP01-018"], deck: ["CP01-023", "CP01-061"], playPoints: 5 } }).play("ECP01-018").pick("CP01-023");
    expect([n.field(), n.zone("me", "deck")]).toEqual([["CP01-023"], ["CP01-061"]]);
  });
});
