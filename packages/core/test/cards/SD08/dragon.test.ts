import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SD08 (Dragoncraft deck; its other cards are reprints). V1 is 1c 2/2, V3 3c 3/4 (Neutral). SD04-001 Fafnir is an 8-cost
// Dragoncraft follower, SD04-011 Glint Dragon a 4-cost one (its Fanfare needs an enemy follower). BP02-054 Dragonsong Flute (act
// with Overflow: engage, discard a card) discards cards.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("SD08", () => {
  it("011 Zahar, Stormwave Dragoon — discarded: a Dragoncraft card costing 7 or more from the top 2; Fanfare: a Dragoncraft follower but Zahar from the top 3", () => {
    const t = d({ me: { field: ["BP02-054"], hand: ["SD08-011"], deck: ["V1", "SD04-001", "V3"], maxPlayPoints: 7 } }).activate("BP02-054").flush();
    expect(t.pick("SD04-001").hand()).toEqual(["SD04-001"]);
    const f = d({ me: { hand: ["SD08-011"], deck: ["SD08-011", "SD04-011", "V1", "V3"], playPoints: 8 } }).play("SD08-011").pick("SD04-011").order();
    expect([f.field(), f.zone("me", "deck")]).toEqual([["SD08-011", "SD04-011"], ["V3", "SD08-011", "V1"]]);
    expect(d({ me: { hand: ["SD08-011"], deck: ["SD08-011", "V1"], playPoints: 8 } }).play("SD08-011").order().field()).toEqual(["SD08-011"]);
  });
});
