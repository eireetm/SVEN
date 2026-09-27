import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP01 Neutral (055–057; 058–062 are Carrot), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot (evolve deck) is what serving
// ({[feed]}) uses; faceup ones are used Carrots. Umamusume followers without Fanfare: CP01-061 Curren Chan (1c 1/1), CP01-023
// Narita Taishin (2c 3/2, BNW), CP01-022 Sirius Symboli (4c 4/4). CP01-021 / 034 / 047 are 1-cost Umamusume spells.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("ECP01 Neutral", () => {
  it("055 Progenitors and Guides — Fanfare, discard an Umamusume card: recover 4; act: cemetery follower / Carrots facedown and 1 EP / +1/+1", () => {
    expect(d({ me: { hand: ["ECP01-055", "CP01-061"], playPoints: 6, maxPlayPoints: 8 } }).play("ECP01-055").yes().pp()).toBe(4);
    const c = d({ me: { field: ["ECP01-055"], faceUpEvolveDeck: [CARROT, CARROT, CARROT], evolutionPoints: 3 } }).activate("ECP01-055").choose("carrots");
    c.pick(CARROT, CARROT);
    expect([c.game.reader().faceUpEvolveDeck(0).length, c.game.state.players[0].evolutionPoints]).toEqual([1, 4]);
    const b = d({ me: { field: ["ECP01-055", "CP01-061", "V1"] } }).activate("ECP01-055").choose("boost");
    expect([b.stats("CP01-061"), b.stats("V1"), b.stats("ECP01-055")]).toEqual([[2, 2], [2, 2], [4, 4]]);
  });

  it("056 Balliamo? — an Umamusume follower from the deck", () => {
    expect(d({ me: { hand: ["ECP01-056"], deck: ["V1", "CP01-061"], playPoints: 2 } }).play("ECP01-056").pick("CP01-061").hand()).toEqual(["CP01-061"]);
  });

  it("057 Ryoka Tsurugi — Fanfare: may summon an Umamusume follower from the hand, returned at your end phase; end phase: leader or Umamusume follower +0/+2", () => {
    const t = d({ me: { hand: ["ECP01-057", "CP01-022"], playPoints: 6 }, opp: { deck: ["V1"] } }).play("ECP01-057").pick("CP01-022");
    expect(t.field()).toEqual(["ECP01-057", "CP01-022"]);
    t.end().pending("ECP01-057").pick("leader").flush();
    expect([t.field(), t.hand(), t.leader()]).toEqual([["ECP01-057"], ["CP01-022"], 22]);
  });

  it("058–062 are printings of Carrot (the card name under their titles)", () => {
    const db = E.db;
    expect(["ECP01-058", "ECP01-062", "ECP01-SL27"].map((p) => db.ofPrinting(p).id)).toEqual(["CP01-085", "CP01-085", "CP01-085"]);
  });
});
