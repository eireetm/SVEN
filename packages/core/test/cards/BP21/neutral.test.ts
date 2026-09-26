import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP21 Neutral (110–116) and BP21-PR10 (Runecraft, Japanese text only). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral).
// Academic (学院): BP21-115 Goblin Genius (1c 2/2), BP21-113 (2c 2/3), BP21-114 (an amulet). Each player starts with 1 SEP.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP21 Neutral", () => {
  it("110 / 111 Lucius, Travelled Trainer — Fanfare: leader +1 and draw; evolved, discard an Academic card: 4 damage", () => {
    const t = d({ me: { hand: ["BP21-110"], deck: ["V1"], playPoints: 3 } }).play("BP21-110");
    expect([t.leader(), t.hand()]).toEqual([21, ["V1"]]);
    const e = d({ me: { field: ["BP21-110"], evolveDeck: ["BP21-111"], hand: ["BP21-115"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-110").yes();
    expect([e.stats("opp:V5"), e.cemetery()]).toEqual([[5, 1], ["BP21-115"]]);
  });

  it("112 Gretina, Champion Fighter — Storm without a SEP; act once per turn, discard an Academic card: 5 damage and draw", () => {
    expect(d({ me: { field: ["BP21-112"], superEvolutionPoints: 0 } }).keywords("BP21-112")).toEqual(["storm"]);
    expect(d({ me: { field: ["BP21-112"] } }).keywords("BP21-112")).toEqual([]);
    const t = d({ me: { field: ["BP21-112"], hand: ["BP21-115", "BP21-115"], deck: ["V1"] }, opp: { field: ["V5"] } }).activate("BP21-112").pick("BP21-115");
    expect([t.field("opp"), t.hand(), t.canActivate("BP21-112")]).toEqual([[], ["BP21-115", "V1"], false]);
  });

  it("113 Arriet, Luxvoice Learner — Fanfare: an Academic card from the top 3; +1/+0 with 3 Academic followers", () => {
    const t = d({ me: { hand: ["BP21-113"], field: ["BP21-115", "BP21-115"], deck: ["V1", "BP21-114", "V3"], playPoints: 2 } }).play("BP21-113");
    t.pick("BP21-114").order();
    expect([t.hand(), t.stats("BP21-113")]).toEqual([["BP21-114"], [3, 3]]);
  });

  it("114 Lainecrest Academy — Fanfare: an Academic card from the top 3; act with 2 Academic followers, engage and bury this: leader +1", () => {
    const t = d({ me: { hand: ["BP21-114"], deck: ["V1", "BP21-115", "V3"], playPoints: 1 } }).play("BP21-114").pick("BP21-115").order();
    expect(t.hand()).toEqual(["BP21-115"]);
    const a = d({ me: { field: ["BP21-114", "BP21-115", "BP21-115"] } }).activate("BP21-114");
    expect([a.leader(), a.field(), a.cemetery()]).toEqual([21, ["BP21-115", "BP21-115"], ["BP21-114"]]);
    expect(d({ me: { field: ["BP21-114", "BP21-115"] } }).canActivate("BP21-114")).toBe(false);
  });

  it("115 Goblin Genius — Fanfare with 3 Academic followers: leader +1", () => {
    expect(d({ me: { hand: ["BP21-115"], field: ["BP21-115", "BP21-113"], playPoints: 1 } }).play("BP21-115").leader()).toBe(21);
    expect(d({ me: { hand: ["BP21-115"], field: ["BP21-115"], playPoints: 1 } }).play("BP21-115").leader()).toBe(20);
  });

  it("116 Goblin's Gratitude — up to 2 Academic cards from the top 4; recover 1 play point", () => {
    const t = d({ me: { hand: ["BP21-116"], deck: ["BP21-115", "V1", "BP21-114", "V3"], playPoints: 3, maxPlayPoints: 5 } }).play("BP21-116");
    t.pick("BP21-115", "BP21-114").order();
    expect([t.hand(), t.pp()]).toEqual([["BP21-115", "BP21-114"], 1]);
  });

  it("PR10 グレアの炎熱 — Quick; 2 damage, 3 with 5 Academic cards in the cemetery (not counting itself)", () => {
    expect(d({ me: { hand: ["BP21-PR10"], cemetery: n(5, "BP21-115"), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP21-PR10").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["BP21-PR10"], cemetery: n(4, "BP21-115"), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP21-PR10").stats("opp:V5")).toEqual([5, 3]);
  });
});
