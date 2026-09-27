import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CSD03a (Cardfight!! Vanguard starter deck, Royal Paladin). V1 is 1c 2/2 (no trigger), V3 3c 3/4, V5 5c 5/5 (Neutral). CP03-127 is a
// Drive Point. Royal Paladin followers: CP03-031 Miru Biru (1c 1/1), CP03-036 Margal (1c 2/2).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const DP = "CP03-127";

describe("CSD03a Royal Paladin", () => {
  it("001 / 002 Alfred Early → King of Knights, Alfred — Storm, Twin Drive; evolved: a Royal Paladin follower costing 3 or less from the deck, +1/+1 to both with 15 Royal Paladin cards", () => {
    const t = d({ me: { field: ["CSD03a-001"], evolveDeck: ["CSD03a-002"], deck: ["CP03-031", "V1"], cemetery: n(15, "CP03-036"), playPoints: 2 } });
    t.evolve("CSD03a-001").pick("CP03-031");
    expect([t.field(), t.stats("CSD03a-001"), t.stats("CP03-031"), t.keywords("CSD03a-001")]).toEqual([
      ["CSD03a-001", "CP03-031"],
      [5, 5],
      [2, 2],
      ["storm", "twinDrive"],
    ]);
    // None found: this follower still gets +1/+1 (ruling).
    const none = d({ me: { field: ["CSD03a-001"], evolveDeck: ["CSD03a-002"], deck: ["V1"], cemetery: n(15, "CP03-036"), playPoints: 2 } });
    expect(none.evolve("CSD03a-001").stats("CSD03a-001")).toEqual([5, 5]);
  });

  it("003 / 004 / 005 Blaster Blade and Wingal — Wingal summons it from the cemetery, its Fanfare evolves it; evolved: 2 damage per Royal Paladin follower", () => {
    const t = d({ me: { field: ["CSD03a-005"], cemetery: ["CSD03a-003"], evolveDeck: ["CSD03a-004"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.activate("CSD03a-005").yes();
    expect([t.field(), t.stats("CSD03a-003"), t.stats("opp:V5"), t.keywords("CSD03a-003")]).toEqual([["CSD03a-005", "CSD03a-003"], [4, 4], [5, 1], ["singleDrive"]]);
    // Played from the hand, it doesn't evolve.
    expect(d({ me: { hand: ["CSD03a-003"], evolveDeck: ["CSD03a-004"], playPoints: 3 } }).play("CSD03a-003").stats("CSD03a-003")).toEqual([3, 3]);
  });

  it("006 Knight of Conviction, Bors — Assail; Ride (1), On Drive: +2/+2", () => {
    const t = d({ me: { field: ["CSD03a-006"], evolveDeck: [DP], playPoints: 1 } }).activate("CSD03a-006");
    expect([t.stats("CSD03a-006"), t.keywords("CSD03a-006").includes("assail")]).toEqual([[5, 5], true]);
  });

  it("007 Flash Shield, Iseult — Quick; 2 damage, or discard a Royal Paladin card: 3 damage and leader +2", () => {
    expect(d({ me: { hand: ["CSD03a-007"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CSD03a-007").choose("1").stats("opp:V5")).toEqual([5, 3]);
    const t = d({ me: { hand: ["CSD03a-007", "CP03-031"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CSD03a-007").choose("2").yes();
    expect([t.stats("opp:V5"), t.leader(), t.cemetery().sort()]).toEqual([[5, 2], 22, ["CP03-031", "CSD03a-007"]]);
  });

  it("008 Knight of Silence, Gallatin — Fanfare: 5 damage; Ride (1), On Drive: +1/+1 and 3 damage to the enemy leader", () => {
    expect(d({ me: { hand: ["CSD03a-008"], playPoints: 5 }, opp: { field: ["V5"] } }).play("CSD03a-008").field("opp")).toEqual([]);
    const t = d({ me: { field: ["CSD03a-008"], evolveDeck: [DP], playPoints: 1 } }).activate("CSD03a-008");
    expect([t.stats("CSD03a-008"), t.leader("opp")]).toEqual([[6, 5], 17]);
  });

  it("009 Little Sage, Marron — Ward; Fanfare: a Royal Paladin card from the top 5", () => {
    const t = d({ me: { hand: ["CSD03a-009"], deck: ["V1", "CP03-031", "V3"], playPoints: 3 } }).play("CSD03a-009").none().pick("CP03-031").order();
    expect(t.hand()).toEqual(["CP03-031"]);
  });

  it("010 Lake Maiden, Lien — Ward; Fanfare, discard a Royal Paladin card: a Royal Paladin follower from the cemetery (not the discarded one)", () => {
    const t = d({ me: { hand: ["CSD03a-010", "CP03-031"], cemetery: ["CP03-036"], playPoints: 2 } }).play("CSD03a-010").none().yes();
    expect([t.hand(), t.cemetery()]).toEqual([["CP03-036"], ["CP03-031"]]);
  });

  it("011 Knight of Rose, Morgana — Ride (1), On Drive: 2 damage to up to 1 and +1/+1; Strike, discard a Royal Paladin card: +1/+1", () => {
    const t = d({ me: { field: ["CSD03a-011"], evolveDeck: [DP], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CSD03a-011").pick("opp:V5");
    expect([t.stats("opp:V5"), t.stats("CSD03a-011")]).toEqual([[5, 3], [3, 3]]);
    const s = d({ me: { field: ["CSD03a-011"], hand: ["CP03-031"] } }).attack("CSD03a-011", "opp:leader").yes();
    expect([s.stats("CSD03a-011"), s.leader("opp")]).toEqual([[3, 3], 17]);
  });

  it("016 Stardust Trumpeter — Starting Amulet; act, engage, bury: a Vanguard follower +1/+1", () => {
    const t = d({ me: { field: ["CSD03a-016", "CP03-031"] } }).activate("CSD03a-016");
    expect([t.stats("CP03-031"), t.cemetery(), t.keywords("CSD03a-016")]).toEqual([[2, 2], ["CSD03a-016"], ["startingAmulet"]]);
  });
});
