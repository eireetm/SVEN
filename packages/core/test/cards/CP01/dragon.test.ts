import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP01 Dragoncraft (040–052), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot is what serving uses.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("CP01 Dragoncraft", () => {
  it("040 / 041 Special Week — Fanfare: may take the top card if it's an Umamusume card; evolved with Overflow: +1/+1 to your other Umamusume followers", () => {
    expect(d({ me: { hand: ["CP01-040"], deck: ["CP01-042", "V1"], playPoints: 2 } }).play("CP01-040").pick("CP01-042").hand()).toEqual(["CP01-042"]);
    expect(d({ me: { hand: ["CP01-040"], deck: ["CP01-042", "V1"], playPoints: 2 } }).play("CP01-040").none().zone("me", "deck")).toEqual(["CP01-042", "V1"]);
    const e = d({ me: { field: ["CP01-040", "CP01-043", "V1"], evolveDeck: ["CP01-041"], playPoints: 7, maxPlayPoints: 7 } }).evolve("CP01-040");
    expect([e.stats("CP01-043"), e.stats("V1")]).toEqual([[2, 4], [2, 2]]);
  });

  it("042 Oguri Cap — serve 2 times: On Race twice (+2/+1 each); Fanfare, discard 2: Storm; Strike: 3 to each enemy follower", () => {
    const t = d({ me: { field: ["CP01-042"], evolveDeck: [CARROT, CARROT], playPoints: 2 } }).activate("CP01-042", 1).flush();
    expect(t.stats("CP01-042")).toEqual([8, 6]);
    const f = d({ me: { hand: ["CP01-042", "V1", "V3"], playPoints: 6 }, opp: { field: ["V3", "V5"] } }).play("CP01-042").yes();
    expect(f.keywords("CP01-042")).toEqual(["storm"]);
    f.attack("CP01-042", "opp:leader");
    expect([f.stats("opp:V3"), f.stats("opp:V5")]).toEqual([[3, 1], [5, 2]]);
  });

  it("043 Seiun Sky — Storm, Intimidate; Strike: +1/+0", () => {
    const t = d({ me: { field: ["CP01-043"] } }).attack("CP01-043", "opp:leader");
    expect([t.leader("opp"), t.keywords("CP01-043")]).toEqual([18, ["storm", "intimidate"]]);
  });

  it("044 Champion's Passion — Fanfare with another Umamusume card: 4 damage; your main phase: 4 to an enemy leader or follower", () => {
    expect(d({ me: { hand: ["CP01-044"], field: ["CP01-043"], playPoints: 7 }, opp: { field: ["V5"] } }).play("CP01-044").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["CP01-044"], playPoints: 7 }, opp: { field: ["V5"] } }).play("CP01-044").stats("opp:V5")).toEqual([5, 5]);
    const t = d({ me: { field: ["CP01-044"], deck: ["V1", "V1"] }, opp: { deck: ["V1"] } }).end().end(); // the enemy leader is the only target
    expect(t.leader("opp")).toBe(16);
  });

  it("045 King Halo — Fanfare: the top card into the EX area 3 times, or a Kawakami Princess from the deck", () => {
    const t = d({ me: { hand: ["CP01-045"], deck: ["V1", "V3", "V5", "V1"], playPoints: 6 } }).play("CP01-045").choose("ex");
    expect(t.ex()).toEqual(["V1", "V3", "V5"]);
    expect(d({ me: { hand: ["CP01-045"], deck: ["V1", "CP01-036"], playPoints: 6 } }).play("CP01-045").choose("kawakami").pick("CP01-036").field()).toEqual([
      "CP01-045",
      "CP01-036",
    ]);
  });

  it("046 Tamamo Cross — On Race: +1/+1 and 2 damage to up to 1 enemy follower", () => {
    const t = d({ me: { field: ["CP01-046"], evolveDeck: [CARROT], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP01-046").pick("opp:V5");
    expect([t.stats("CP01-046"), t.stats("opp:V5")]).toEqual([[3, 2], [5, 3]]);
  });

  it("047 Flowers for You — +1/+0 to an Umamusume follower and draw; a Seiun Sky gets +1/+1 more", () => {
    const t = d({ me: { hand: ["CP01-047"], field: ["CP01-043"], deck: ["V1"], playPoints: 1 } }).play("CP01-047");
    expect([t.stats("CP01-043"), t.hand()]).toEqual([[3, 4], ["V1"]]);
    expect(d({ me: { hand: ["CP01-047"], field: ["CP01-046"], deck: ["V1"], playPoints: 1 } }).play("CP01-047").stats("CP01-046")).toEqual([3, 1]);
  });

  it("048 Bamboo Memory — Fanfare, discard a card: 2 to the enemy leader", () => {
    expect(d({ me: { hand: ["CP01-048", "V1"], playPoints: 2 } }).play("CP01-048").yes().leader("opp")).toBe(18);
  });

  it("049 Yaeno Muteki — On Race: +1/+1 to this and up to 1 other follower of yours", () => {
    const t = d({ me: { field: ["CP01-049", "V1"], evolveDeck: [CARROT], playPoints: 1 } }).activate("CP01-049").pick("V1");
    expect([t.stats("CP01-049"), t.stats("V1")]).toEqual([[4, 4], [3, 3]]);
  });

  it("050 Grass Wonder / 051 Super Creek / 052 Hishi Akebono — Fanfare: 2 to each enemy follower / leader +5 (Ward) / leader +10", () => {
    expect(d({ me: { hand: ["CP01-050"], playPoints: 5 }, opp: { field: ["V1", "V5"] } }).play("CP01-050").field("opp")).toEqual(["V5"]);
    expect(d({ me: { hand: ["CP01-051"], playPoints: 6 } }).play("CP01-051").none().leader()).toBe(25);
    expect(d({ me: { hand: ["CP01-052"], playPoints: 10 } }).play("CP01-052").leader()).toBe(30);
  });
});
