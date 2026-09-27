import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP01 Dragoncraft (028–036), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot (evolve deck) is what serving
// ({[feed]}) uses; faceup ones are used Carrots. Umamusume followers without Fanfare: CP01-061 Curren Chan (1c 1/1), CP01-023
// Narita Taishin (2c 3/2, BNW), CP01-022 Sirius Symboli (4c 4/4). CP01-021 / 034 / 047 are 1-cost Umamusume spells.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("ECP01 Dragoncraft", () => {
  it("028 Neo Universe — Fanfare: with Overflow, 4 damage and draw", () => {
    const t = d({ me: { hand: ["ECP01-028"], deck: ["V1"], playPoints: 3, maxPlayPoints: 7 }, opp: { field: ["V5"] } }).play("ECP01-028");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 1], ["V1"]]);
    const n = d({ me: { hand: ["ECP01-028"], deck: ["V1"], playPoints: 3, maxPlayPoints: 6 }, opp: { field: ["V5"] } }).play("ECP01-028");
    expect([n.stats("opp:V5"), n.hand()]).toEqual([[5, 5], []]);
  });

  it("029 / 031 Neo Universe discards Katsuragi Ace for +1 max play point; then Overflow, (3): Katsuragi Ace onto the field (ruling)", () => {
    const t = d({ me: { field: ["ECP01-028"], evolveDeck: ["ECP01-029"], hand: ["ECP01-031"], playPoints: 5, maxPlayPoints: 6 }, opp: { field: ["V5"] } });
    t.evolve("ECP01-028").choose("one").yes().yes();
    expect([t.field(), t.field("opp"), t.game.state.players[0].maxPlayPoints, t.pp()]).toEqual([["ECP01-028", "ECP01-031"], [], 7, 0]);
  });

  it("029 Neo Universe (Evolved) — at the start of your end phase, 2 damage to an enemy follower", () => {
    const t = d({ me: { field: [{ card: "ECP01-028", evolvedInto: "ECP01-029" }] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect(t.stats("opp:V5")).toEqual([5, 3]);
  });

  it("030 Mr. C.B. — On Race: +1/+1, refresh, draw; act, engage, discard an Umamusume card: 5 damage, draw if it cost 7 or more", () => {
    const t = d({ me: { field: ["ECP01-030"], hand: ["ECP01-031"], deck: ["V1"] }, opp: { field: ["V5"] } }).activate("ECP01-030");
    expect([t.field("opp"), t.hand(), t.engaged("ECP01-030")]).toEqual([[], ["V1"], true]);
    const r = d({ me: { field: [{ card: "ECP01-030", engaged: true }], evolveDeck: [CARROT], deck: ["V1"], playPoints: 1 } }).activate("ECP01-030");
    expect([r.stats("ECP01-030"), r.engaged("ECP01-030"), r.hand()]).toEqual([[5, 5], false, ["V1"]]);
  });

  it("031 Katsuragi Ace — discarded by an Umamusume card's ability with Overflow: may pay 3 to summon it; Fanfare: destroy", () => {
    const t = d({ me: { field: ["ECP01-030"], hand: ["ECP01-031"], deck: ["V1"], playPoints: 3, maxPlayPoints: 7 }, opp: { field: ["V5", "V3"] } });
    t.activate("ECP01-030").pick("opp:V3").yes();
    expect([t.field(), t.field("opp"), t.pp()]).toEqual([["ECP01-030", "ECP01-031"], [], 0]);
    // The cost may be left unpaid (ruling).
    const n = d({ me: { field: ["ECP01-030"], hand: ["ECP01-031"], deck: ["V1"], playPoints: 3, maxPlayPoints: 7 }, opp: { field: ["V5"] } });
    n.activate("ECP01-030").no();
    expect([n.field(), n.cemetery()]).toEqual([["ECP01-030"], ["ECP01-031"]]);
  });

  it("032 Super Creek — Ward; Fanfare: leader +3, with Overflow max play points +1; act with Overflow: an Umamusume card costing 7+ from the cemetery", () => {
    const t = d({ me: { hand: ["ECP01-032"], playPoints: 4, maxPlayPoints: 7 } }).play("ECP01-032").none();
    expect([t.leader(), t.game.state.players[0].maxPlayPoints]).toEqual([23, 8]);
    expect(d({ me: { field: ["ECP01-032"], cemetery: ["ECP01-031", "CP01-061"], maxPlayPoints: 7 } }).activate("ECP01-032").hand()).toEqual(["ECP01-031"]);
    expect(d({ me: { field: ["ECP01-032"], cemetery: ["ECP01-031"], maxPlayPoints: 6 } }).canActivate("ECP01-032")).toBe(false);
  });

  it("033 Tsurumaru Tsuyoshi — Fanfare: damage equal to the faceup Carrots in your evolve deck", () => {
    const t = d({ me: { hand: ["ECP01-033"], faceUpEvolveDeck: [CARROT, CARROT, CARROT], evolveDeck: [CARROT], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(t.play("ECP01-033").stats("opp:V5")).toEqual([5, 2]);
  });

  it("034 El Condor Pasa — Storm; Fanfare: Champion's Passion from the deck onto the field", () => {
    const t = d({ me: { hand: ["ECP01-034"], deck: ["V1", "CP01-044"], playPoints: 7 }, opp: { field: ["V5"] } }).play("ECP01-034").pick("CP01-044");
    expect([t.field(), t.stats("opp:V5")]).toEqual([["ECP01-034", "CP01-044"], [5, 1]]);
  });

  it("035 Nishino Flower — On Race: +1/+1 and a Seiun Sky from the deck onto the field", () => {
    const t = d({ me: { field: ["ECP01-035"], evolveDeck: [CARROT], deck: ["V1", "CP01-043"], playPoints: 1 } }).activate("ECP01-035").pick("CP01-043");
    expect([t.stats("ECP01-035"), t.field()]).toEqual([[4, 4], ["ECP01-035", "CP01-043"]]);
  });

  it("036 Pious Flame, Heaven's Scorcher — discard an Umamusume card: 2 less; 5 damage, draw if it cost 7 or more", () => {
    const t = d({ me: { hand: ["ECP01-036", "ECP01-031"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).play("ECP01-036");
    expect([t.field("opp"), t.hand(), t.pp()]).toEqual([[], ["V1"], 0]);
    const n = d({ me: { hand: ["ECP01-036", "CP01-061"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP01-036").choose("discard");
    expect([n.field("opp"), n.hand(), n.pp()]).toEqual([[], [], 2]);
  });
});
