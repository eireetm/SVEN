import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP03 Abysscraft (083–103), Cardfight!! Vanguard (Shadow Paladin). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP03-127 is a
// Drive Point. Shadow Paladin cards: CP03-093 Black Sage, Charon (1c 2/2; Fanfare: bury the top card), CP03-086 Blaster Dark (3c,
// Single Drive), CP03-084 Phantom Blaster Dragon. `n(10, "CP03-093")` fills the cemetery with Shadow Paladin cards.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const DP = "CP03-127";

describe("CP03 Abysscraft", () => {
  it("083 Phantom Blaster Overlord — with 15 Shadow Paladin cards, bury a Phantom Blaster Dragon instead of paying; Fanfare: destroy, draw 3; act: +6/+6", () => {
    const t = d({ me: { hand: ["CP03-083"], field: ["CP03-084"], cemetery: n(15, "CP03-093"), deck: ["V1", "V1", "V1"], playPoints: 0 }, opp: { field: ["V5"] } });
    t.play("CP03-083").none();
    expect([t.field(), t.field("opp"), t.hand().length, t.cemetery().includes("CP03-084")]).toEqual([["CP03-083"], [], 3, true]);
    expect(d({ me: { hand: ["CP03-083"], field: ["CP03-084"], cemetery: n(14, "CP03-093"), playPoints: 0 } }).canPlay("CP03-083")).toBe(false);
    expect(d({ me: { field: ["CP03-083"], hand: ["CP03-083"], playPoints: 1 } }).activate("CP03-083").stats("CP03-083")).toEqual([12, 12]);
  });

  it("084 / 085 Phantom Blaster Dragon — bury a Shadow Paladin follower to play it; a buried Blaster Dark evolves it; evolved: destroy with 10 Shadow Paladin cards", () => {
    expect(d({ me: { hand: ["CP03-084"], playPoints: 3 } }).canPlay("CP03-084")).toBe(false);
    const dark = d({ me: { hand: ["CP03-084"], field: ["CP03-086"], evolveDeck: ["CP03-085"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP03-084").yes();
    expect([dark.stats("CP03-084"), dark.field("opp"), dark.cemetery()]).toEqual([[5, 4], ["V5"], ["CP03-086"]]);
    const other = d({ me: { hand: ["CP03-084"], field: ["CP03-093"], evolveDeck: ["CP03-085"], playPoints: 3 } }).play("CP03-084");
    expect([other.stats("CP03-084"), other.keywords("CP03-084")]).toEqual([[4, 3], ["storm", "twinDrive"]]);
    const e = d({ me: { field: ["CP03-084"], evolveDeck: ["CP03-085"], cemetery: n(10, "CP03-093"), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP03-084");
    expect(e.field("opp")).toEqual([]);
  });

  it("086 / 087 Blaster Dark — Single Drive; Fanfare: bury the top 2; evolved: 3 damage, then 1 more for every 5 Shadow Paladin cards", () => {
    expect(d({ me: { hand: ["CP03-086"], deck: ["V1", "V3", "V5"], playPoints: 3 } }).play("CP03-086").cemetery()).toEqual(["V1", "V3"]);
    const e = (sp: number) =>
      d({ me: { field: ["CP03-086"], evolveDeck: ["CP03-087"], cemetery: n(sp, "CP03-093"), playPoints: 1 }, opp: { field: ["V5", "V1"] } })
        .evolve("CP03-086")
        .pick("opp:V5");
    expect([e(10).field("opp"), e(5).stats("opp:V5")]).toEqual([["V1"], [5, 1]]);
  });

  it("088 Skull Witch, Nemain — Ride (1): +1/+1, a Shadow Paladin card from the top 3, bury the rest; Fanfare: 4 damage", () => {
    const t = d({ me: { field: ["CP03-088"], evolveDeck: [DP], deck: ["V1", "CP03-093", "V3"], playPoints: 1 } }).activate("CP03-088").pick("CP03-093");
    expect([t.hand(), t.cemetery(), t.stats("CP03-088")]).toEqual([["CP03-093"], ["V1", "V3"], [4, 4]]);
    expect(d({ me: { hand: ["CP03-088"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP03-088").stats("opp:V5")).toEqual([5, 1]);
  });

  it("089 Knight of Nullity, Masquerade — Rush and Bane with 10 Shadow Paladin cards; Strike with a Blaster follower in the cemetery: 2 to the enemy leader", () => {
    expect(d({ me: { field: ["CP03-089"], cemetery: n(10, "CP03-093") } }).keywords("CP03-089")).toEqual(["rush", "bane"]);
    expect(d({ me: { field: ["CP03-089"], cemetery: ["CP03-086"] } }).attack("CP03-089", "opp:leader").leader("opp")).toBe(16);
    expect(d({ me: { hand: ["CP03-089"], deck: ["V1"], playPoints: 2 } }).play("CP03-089").cemetery()).toEqual(["V1"]);
  });

  it("090 Darkness Maiden, Macha — Ride (1): +1/+1 and a Shadow Paladin follower costing 2 or less from the deck onto the field", () => {
    const t = d({ me: { field: ["CP03-090"], evolveDeck: [DP], deck: ["V1", "CP03-093", "V3"], playPoints: 1 } }).activate("CP03-090").pick("CP03-093");
    expect([t.field(), t.stats("CP03-090")]).toEqual([["CP03-090", "CP03-093"], [4, 4]]);
  });

  it("091 Cursed Lancer — Fanfare: leader +3, bury the top 2; end phase: destroy an enemy follower with 10 Shadow Paladin cards", () => {
    const f = d({ me: { hand: ["CP03-091"], deck: ["V1", "V3", "V5"], playPoints: 5 } }).play("CP03-091");
    expect([f.leader(), f.cemetery()]).toEqual([23, ["V1", "V3"]]);
    expect(d({ me: { field: ["CP03-091"], cemetery: n(10, "CP03-093") }, opp: { field: ["V5"], deck: ["V1"] } }).end().field("opp")).toEqual([]);
    expect(d({ me: { field: ["CP03-091"], cemetery: n(9, "CP03-093") }, opp: { field: ["V5"], deck: ["V1"] } }).end().field("opp")).toEqual(["V5"]);
  });

  it("092 Knight of Darkness, Rugos — Ride (1): 2 damage to up to 1, +1/+1, bury the top card", () => {
    const t = d({ me: { field: ["CP03-092"], evolveDeck: [DP], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-092").pick("opp:V5");
    expect([t.stats("opp:V5"), t.stats("CP03-092"), t.cemetery()]).toEqual([[5, 3], [3, 3], ["V1"]]);
  });

  it("093 Black Sage, Charon — Fanfare: bury the top card", () => {
    expect(d({ me: { hand: ["CP03-093"], deck: ["V1", "V3"], playPoints: 1 } }).play("CP03-093").cemetery()).toEqual(["V1"]);
  });

  it("094 Doranbau — Bane with 10 Shadow Paladin cards; a follower of yours drive-checks: bury the top card", () => {
    expect(d({ me: { field: ["CP03-094"], cemetery: n(10, "CP03-093") } }).keywords("CP03-094")).toEqual(["bane"]);
    const t = d({ me: { field: ["CP03-094", "CP03-086"], deck: ["V1", "V3"] } }).attack("CP03-086", "opp:leader");
    expect([t.cemetery(), t.zone("me", "deck")]).toEqual([["V3"], ["V1"]]);
  });

  it("095 Blaster Javelin — Rush; Fanfare, discard a Vanguard card: a Phantom Blaster Dragon or Blaster Dark from the deck", () => {
    const t = d({ me: { hand: ["CP03-095", "CP03-093"], deck: ["V1", "CP03-086"], playPoints: 2 } }).play("CP03-095").yes().pick("CP03-086");
    expect([t.hand(), t.cemetery()]).toEqual([["CP03-086"], ["CP03-093"]]);
  });

  it("096 Dark Shield, Mac Lir — Quick; 2 damage, or discard a Shadow Paladin card: 3 damage and bury the top card", () => {
    const t = d({ me: { hand: ["CP03-096", "CP03-093"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP03-096").choose("2").yes();
    expect([t.stats("opp:V5"), t.cemetery().sort()]).toEqual([[5, 2], ["CP03-093", "CP03-096", "V1"]]);
  });

  it("097 Grim Reaper — Storm with 10 Shadow Paladin cards", () => {
    expect(d({ me: { field: ["CP03-097"], cemetery: n(10, "CP03-093") } }).keywords("CP03-097")).toEqual(["storm"]);
    expect(d({ me: { field: ["CP03-097"], cemetery: n(9, "CP03-093") } }).keywords("CP03-097")).toEqual([]);
  });

  it("098 Abyss Freezer — Fanfare, discard a Shadow Paladin card: a Shadow Paladin follower from the cemetery, selected before the discard", () => {
    const t = d({ me: { hand: ["CP03-098", "CP03-093"], cemetery: ["CP03-086"], playPoints: 2 } }).play("CP03-098").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["CP03-086"], ["CP03-093"]]);
  });

  it("099 Darkside Trumpeter — end phase: refresh a Shadow Paladin follower with 10 Shadow Paladin cards", () => {
    const t = d({ me: { field: ["CP03-099", { card: "CP03-093", engaged: true }], cemetery: n(10, "CP03-093") }, opp: { deck: ["V1"] } }).end().pick("CP03-093");
    expect(t.engaged("CP03-093")).toBe(false);
  });

  it("100 Abyss Healer — Ward; Fanfare with 10 Shadow Paladin cards: leader +3", () => {
    expect(d({ me: { hand: ["CP03-100"], cemetery: n(10, "CP03-093"), playPoints: 2 } }).play("CP03-100").none().leader()).toBe(23);
    expect(d({ me: { hand: ["CP03-100"], cemetery: n(9, "CP03-093"), playPoints: 2 } }).play("CP03-100").none().leader()).toBe(20);
  });

  it("101 Arianrhod — Ride (1): +1/+1, may discard a Shadow Paladin card to draw 2", () => {
    const t = d({ me: { field: ["CP03-101"], evolveDeck: [DP], hand: ["CP03-093"], deck: ["V1", "V1"], playPoints: 1 } }).activate("CP03-101").yes();
    expect([t.hand(), t.cemetery(), t.stats("CP03-101")]).toEqual([["V1", "V1"], ["CP03-093"], [3, 3]]);
  });

  it("102 Gururubau — Quick; destroy an enemy follower and up to 1 Shadow Paladin follower from the cemetery to the hand", () => {
    const t = d({ me: { hand: ["CP03-102"], cemetery: ["CP03-093"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP03-102").pick("CP03-093");
    expect([t.field("opp"), t.hand()]).toEqual([[], ["CP03-093"]]);
  });

  it("103 Fullbau — Starting Amulet; act, engage and bury, with a Shadow Paladin follower: bury the top 2", () => {
    const t = d({ me: { field: ["CP03-103", "CP03-093"], deck: ["V1", "V3", "V5"] } }).activate("CP03-103");
    expect([t.cemetery().sort(), t.field()]).toEqual([["CP03-103", "V1", "V3"], ["CP03-093"]]);
  });
});
