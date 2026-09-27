import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CSD03b (Cardfight!! Vanguard starter deck, Kagero). V1 is 1c 2/2 (no trigger), V3 3c 3/4, V5 5c 5/5 (Neutral). CP03-127 is a Drive
// Point. Kagero cards: CP03-080 Irontail Dragon (1c 1/2), CP03-076 Embodiment of Spear, Tahr (2c 3/1, also CSD03b-012). Overflow: 7 or
// more max play points.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const DP = "CP03-127";
const OVERFLOW = { maxPlayPoints: 7 };

describe("CSD03b Kagero", () => {
  it("001 Dragonic Overlord — Twin Drive; Storm with Overflow and another Kagero follower", () => {
    const t = d({ me: { hand: ["CSD03b-001"], field: ["CP03-080"], playPoints: 4, ...OVERFLOW } }).play("CSD03b-001");
    expect([t.keywords("CSD03b-001"), t.attackTargets("CSD03b-001")]).toEqual([["twinDrive", "storm"], ["opp:leader"]]);
    expect(d({ me: { hand: ["CSD03b-001"], playPoints: 4, ...OVERFLOW } }).play("CSD03b-001").keywords("CSD03b-001")).toEqual(["twinDrive"]);
    expect(d({ me: { hand: ["CSD03b-001"], field: ["CP03-080"], playPoints: 4 } }).play("CSD03b-001").keywords("CSD03b-001")).toEqual(["twinDrive"]);
  });

  it("002 Dragonic Overlord (Evolved) — 5 damage; with Overflow, once this turn it refreshes when it deals combat damage", () => {
    const opp = { field: ["V5", { card: "V1", engaged: true }, { card: "V1", engaged: true }] };
    const t = d({ me: { field: ["CSD03b-001"], evolveDeck: ["CSD03b-002"], deck: n(4, "V1"), playPoints: 1, ...OVERFLOW }, opp });
    t.evolve("CSD03b-001").pick("opp:V5");
    expect(t.field("opp")).toEqual(["V1", "V1"]);
    t.attack("CSD03b-001", "opp:V1").flush();
    expect([t.engaged("CSD03b-001"), t.field("opp")]).toEqual([false, ["V1"]]);
    t.attack("CSD03b-001", "opp:V1").flush();
    expect([t.engaged("CSD03b-001"), t.field("opp")]).toEqual([true, []]);
    const u = d({ me: { field: ["CSD03b-001"], evolveDeck: ["CSD03b-002"], deck: n(2, "V1"), playPoints: 1 }, opp }).evolve("CSD03b-001").pick("opp:V5");
    expect(u.attack("CSD03b-001", "opp:V1").flush().engaged("CSD03b-001")).toBe(true);
  });

  it("003 Dragon Monk, Goku — Ward; act, engage, banish 4 Kagero cards from the cemetery: 4 damage to the enemy leader and followers", () => {
    const t = d({ me: { field: ["CSD03b-003"], cemetery: n(4, "CP03-080") }, opp: { field: ["V5"] } }).activate("CSD03b-003");
    expect([t.leader("opp"), t.stats("opp:V5"), t.zone("me", "banished").length]).toEqual([16, [5, 1], 4]);
  });

  it("004 / 005 Dragon Knight, Aleph → Embodiment of Victory, Aleph — Fanfare with Bahr and Tahr in the cemetery: evolve; evolved: a Kagero follower from the top 3 into the EX area, 3 less", () => {
    const t = d({
      me: { hand: ["CSD03b-004"], cemetery: ["CSD03b-009", "CP03-076"], evolveDeck: ["CSD03b-005"], deck: ["CSD03b-004", "CP03-080", "V1"], playPoints: 3 },
    });
    t.play("CSD03b-004").yes().pick("CP03-080").order();
    expect([t.stats("CSD03b-004"), t.ex(), t.canPlay("CP03-080")]).toEqual([[4, 4], ["CP03-080"], true]);
    expect(d({ me: { hand: ["CSD03b-004"], cemetery: ["CSD03b-009"], evolveDeck: ["CSD03b-005"], playPoints: 3 } }).play("CSD03b-004").stats("CSD03b-004")).toEqual([3, 3]);
  });

  it("006 Berserk Dragon — Fanfare, discard a Kagero card: 2 damage; Ride (1), On Drive: 3 damage to up to 1 and +1/+1", () => {
    const t = d({ me: { hand: ["CSD03b-006", "CP03-080"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CSD03b-006").yes();
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 3], ["CP03-080"]]);
    const r = d({ me: { field: ["CSD03b-006"], evolveDeck: [DP], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CSD03b-006").pick("opp:V5");
    expect([r.stats("opp:V5"), r.stats("CSD03b-006")]).toEqual([[5, 2], [4, 4]]);
  });

  it("007 Wyvern Guard, Barri — Quick; 2 damage, or discard a Kagero card: 3 damage and 1 to its leader", () => {
    expect(d({ me: { hand: ["CSD03b-007"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CSD03b-007").choose("1").stats("opp:V5")).toEqual([5, 3]);
    const t = d({ me: { hand: ["CSD03b-007", "CP03-080"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CSD03b-007").choose("2").yes();
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 2], 19]);
  });

  it("008 Dragon Knight, Nehalem — Ride (1), On Drive: 2 damage to up to 1 and +1/+1; Strike: 1 damage to the enemy leader", () => {
    const r = d({ me: { field: ["CSD03b-008"], evolveDeck: [DP], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CSD03b-008").pick("opp:V5");
    expect([r.stats("opp:V5"), r.stats("CSD03b-008")]).toEqual([[5, 3], [3, 3]]);
    expect(d({ me: { field: ["CSD03b-008"] } }).attack("CSD03b-008", "opp:leader").leader("opp")).toBe(17);
  });

  it("009 Embodiment of Armor, Bahr — Ward; Fanfare: draw", () => {
    expect(d({ me: { hand: ["CSD03b-009"], deck: ["V1"], playPoints: 3 } }).play("CSD03b-009").none().hand()).toEqual(["V1"]);
  });

  it("010 Chain-Attack Sutherland — Fanfare: a Vanguard follower +3 attack; act, engage, bury: damage equal to its attack on the field", () => {
    const t = d({ me: { hand: ["CSD03b-010"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CSD03b-010");
    expect(t.stats("CSD03b-010")).toEqual([5, 2]);
    t.activate("CSD03b-010");
    expect([t.field("opp"), t.cemetery()]).toEqual([[], ["CSD03b-010"]]);
  });

  it("011 Follower, Reas — Ride (2), On Drive: +1/+1 and a Kagero follower from the deck", () => {
    const t = d({ me: { field: ["CSD03b-011"], evolveDeck: [DP], deck: ["V1", "CP03-080"], playPoints: 2 } }).activate("CSD03b-011").pick("CP03-080");
    expect([t.stats("CSD03b-011"), t.hand()]).toEqual([[2, 2], ["CP03-080"]]);
  });

  it("016 Lizard Runner, Undeux — Starting Amulet; act, engage, bury: a Vanguard follower +1/+1", () => {
    const t = d({ me: { field: ["CSD03b-016", "CP03-080"] } }).activate("CSD03b-016");
    expect([t.stats("CP03-080"), t.cemetery()]).toEqual([[2, 3], ["CSD03b-016"]]);
  });
});
