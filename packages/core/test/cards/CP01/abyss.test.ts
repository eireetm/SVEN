import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP01 Abysscraft (053–065), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot is what serving uses.
// QUICK-SAC (0) destroys a follower of yours; AMULET is a 1-cost amulet. CP01-064 is an Umamusume card for the cemetery counts.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const CARROT = "CP01-085";

describe("CP01 Abysscraft", () => {
  it("053 / 054 Maruzensky — Fanfare, Necrocharge (10): -4/-4; evolved: -2/-2", () => {
    expect(d({ me: { hand: ["CP01-053"], cemetery: n(10, "V1"), playPoints: 3 }, opp: { field: ["V5"] } }).play("CP01-053").stats("opp:V5")).toEqual([1, 1]);
    expect(d({ me: { hand: ["CP01-053"], cemetery: n(9, "V1"), playPoints: 3 }, opp: { field: ["V5"] } }).play("CP01-053").stats("opp:V5")).toEqual([5, 5]);
    expect(d({ me: { field: ["CP01-053"], evolveDeck: ["CP01-054"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP01-053").stats("opp:V5")).toEqual([3, 3]);
  });

  it("055 Rice Shower — Ward; Fanfare: 3 damage and mill 2; Last Words: another-named Umamusume follower from the cemetery", () => {
    const t = d({ me: { hand: ["CP01-055"], deck: ["V1", "V3", "V5"], playPoints: 5 }, opp: { field: ["V5"] } }).play("CP01-055").none();
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 2], ["V1", "V3"]]);
    const lw = d({ me: { field: ["CP01-055"], hand: ["QUICK-SAC"], cemetery: ["CP01-055", "CP01-064"] } }).play("QUICK-SAC");
    expect(lw.hand()).toEqual(["CP01-064"]);
  });

  it("056 Nice Nature — Fanfare: -1/-1; Last Words: the opponent discards a card", () => {
    expect(d({ me: { hand: ["CP01-056"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP01-056").stats("opp:V5")).toEqual([4, 4]);
    expect(d({ me: { field: ["CP01-056"], hand: ["QUICK-SAC"] }, opp: { hand: ["V1"] } }).play("QUICK-SAC").hand("opp")).toEqual([]);
  });

  it("057 7 More Centimeters — only with 20 Umamusume cards in the cemetery: destroy each enemy follower, draw 3, the opponent discards 3", () => {
    expect(d({ me: { hand: ["CP01-057"], cemetery: n(19, "CP01-064"), playPoints: 5 } }).canPlay("CP01-057")).toBe(false);
    const t = d({ me: { hand: ["CP01-057"], cemetery: n(20, "CP01-064"), deck: ["V1", "V1", "V1"], playPoints: 5 }, opp: { field: ["V5"], hand: ["V1", "V3", "V5"] } });
    t.play("CP01-057");
    expect([t.field("opp"), t.hand().length, t.hand("opp")]).toEqual([[], 3, []]);
  });

  it("058 Fine Motion — On Race: +1/+1, leader +2, mill 2", () => {
    const t = d({ me: { field: ["CP01-058"], evolveDeck: [CARROT], deck: ["V1", "V3"], playPoints: 1 } }).activate("CP01-058");
    expect([t.stats("CP01-058"), t.leader(), t.cemetery()]).toEqual([[4, 4], 22, ["V1", "V3"]]);
  });

  it("059 Mayano Top Gun — Rush; Fanfare with 4 other Umamusume cards: Storm; with 5 in the cemetery: +2/+0", () => {
    const t = d({ me: { hand: ["CP01-059"], field: n(4, "CP01-064"), cemetery: n(5, "CP01-064"), playPoints: 1 } }).play("CP01-059").flush();
    expect([t.keywords("CP01-059"), t.stats("CP01-059")]).toEqual([["rush", "storm"], [4, 1]]);
  });

  it("060 My Solo Drawn to Raindrop Drums — Quick; 2 less with 10 Umamusume cards in your cemetery; destroy", () => {
    expect(d({ me: { hand: ["CP01-060"], cemetery: n(10, "CP01-064"), playPoints: 2 }, opp: { field: ["V5"] } }).play("CP01-060").field("opp")).toEqual([]);
    expect(d({ me: { hand: ["CP01-060"], cemetery: n(9, "CP01-064"), playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("CP01-060")).toBe(false);
  });

  it("061 Curren Chan — act (1), engage: 1 damage and mill 1", () => {
    const t = d({ me: { field: ["CP01-061"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP01-061");
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 4], ["V1"]]);
  });

  it("062 Twin Turbo — Assail; Fanfare with 10 Umamusume cards in the cemetery: Storm", () => {
    expect(d({ me: { hand: ["CP01-062"], cemetery: n(10, "CP01-064"), playPoints: 2 } }).play("CP01-062").keywords("CP01-062")).toEqual(["assail", "storm"]);
  });

  it("063 Sakura Chiyono O — On Race: +1/+1, up to 1 Umamusume card from the cemetery", () => {
    const t = d({ me: { field: ["CP01-063"], evolveDeck: [CARROT], cemetery: ["CP01-064", "V1"], playPoints: 1 } }).activate("CP01-063").pick("CP01-064");
    expect([t.stats("CP01-063"), t.hand()]).toEqual([[4, 4], ["CP01-064"]]);
  });

  it("064 Seeking the Pearl — Last Words: mill 2", () => {
    expect(d({ me: { field: ["CP01-064"], hand: ["QUICK-SAC"], deck: ["V1", "V3", "V5"] } }).play("QUICK-SAC").zone("me", "deck")).toEqual(["V5"]);
  });

  it("065 Matikanetannhauser — Fanfare: destroy an enemy amulet", () => {
    expect(d({ me: { hand: ["CP01-065"], playPoints: 4 }, opp: { field: ["AMULET"] } }).play("CP01-065").field("opp")).toEqual([]);
  });
});
