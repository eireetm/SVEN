import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP03 Swordcraft (022–041), Cardfight!! Vanguard (Royal Paladin). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP03-127 is a
// Drive Point. Royal Paladin cards without effects on their own here: CP03-031 Miru Biru (1c), CP03-036 Margal (1c). Blaster
// followers: CP03-086 Blaster Dark, CP03-095 Blaster Javelin. Blaster Blade (CSD03a) is not in a supported set yet.
// QUICK-SAC (0) destroys a follower of yours; CP02-076 (3c) deals 2 damage to your leader.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const DP = "CP03-127";

describe("CP03 Swordcraft", () => {
  it("022 Majesty Lord Blaster — Storm, Twin Drive; no Blaster Blade and Blaster Dark pair: no destruction, no +2/+2", () => {
    const t = d({ me: { field: ["CP03-022"], cemetery: ["CP03-086"], deck: ["V1", "V1"] } }).attack("CP03-022", "opp:leader").flush();
    expect([t.stats("CP03-022"), t.leader("opp"), t.keywords("CP03-022")]).toEqual([[4, 4], 16, ["storm", "twinDrive"]]);
  });

  it("023 Palamedes — Fanfare: 5 damage; with 15 Royal Paladin cards in the cemetery: Storm and a Strike giving +1/+1", () => {
    expect(d({ me: { hand: ["CP03-023"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP03-023").field("opp")).toEqual([]);
    const t = d({ me: { field: ["CP03-023"], cemetery: n(15, "CP03-031") } });
    expect(t.keywords("CP03-023")).toEqual(["storm"]);
    expect(t.attack("CP03-023", "opp:leader").leader("opp")).toBe(14);
    expect(d({ me: { field: ["CP03-023"], cemetery: n(14, "CP03-031") } }).keywords("CP03-023")).toEqual([]);
  });

  it("024 Star Call Trumpeter — Ride (1): 4 damage to up to 1, +1/+1; Fanfare: two Blaster followers from the deck, one to the hand, one buried", () => {
    const t = d({ me: { hand: ["CP03-024"], deck: ["CP03-086", "V1", "CP03-095"], playPoints: 4 } }).play("CP03-024").pick("CP03-086", "CP03-095");
    t.pick("CP03-086");
    expect([t.hand(), t.cemetery()]).toEqual([["CP03-086"], ["CP03-095"]]);
    expect(d({ me: { hand: ["CP03-024"], deck: ["CP03-095", "V1"], playPoints: 4 } }).play("CP03-024").pick("CP03-095").hand()).toEqual(["CP03-095"]);
    const r = d({ me: { field: ["CP03-024"], evolveDeck: [DP], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-024").pick("opp:V5");
    expect([r.stats("opp:V5"), r.stats("CP03-024")]).toEqual([[5, 1], [4, 4]]);
  });

  it("025 / 026 High Dog Breeder, Akane — Fanfare: up to 2 Royal Paladin followers costing 2 or less from the top 5 with Rush; Soul Saver Dragon: +2/+2 to up to 2", () => {
    const t = d({ me: { hand: ["CP03-025"], deck: ["CP03-031", "CP03-036", "V1", "CP03-032", "V3"], playPoints: 5 } }).play("CP03-025");
    t.pick("CP03-031", "CP03-036").order();
    expect([t.field(), t.keywords("CP03-031")]).toEqual([["CP03-025", "CP03-031", "CP03-036"], ["rush"]]);
    const e = d({ me: { field: ["CP03-025", "CP03-031", "CP03-036"], evolveDeck: ["CP03-026"], playPoints: 2 } }).evolve("CP03-025").pick("CP03-031", "CP03-036");
    expect([e.stats("CP03-031"), e.stats("CP03-036"), e.keywords("CP03-025")]).toEqual([[3, 3], [4, 4], ["twinDrive"]]);
  });

  it("027 Bedivere — Ward; Fanfare with a Blaster follower: +1/+0 and Storm", () => {
    const t = d({ me: { hand: ["CP03-027"], field: ["CP03-086"], playPoints: 2 } }).play("CP03-027").none();
    expect([t.stats("CP03-027"), t.keywords("CP03-027")]).toEqual([[4, 2], ["ward", "storm"]]);
  });

  it("028 Gancelot — Rush, Assail, Twin Drive; without a Blaster Blade in the cemetery the Fanfare does nothing", () => {
    const t = d({ me: { hand: ["CP03-028"], deck: ["V1", "V1"], playPoints: 4 } }).play("CP03-028");
    expect([t.hand(), t.keywords("CP03-028")]).toEqual([[], ["rush", "assail", "twinDrive"]]);
  });

  it("029 Kay — turn a faceup evolved Blaster follower in the evolve deck facedown: 3 less; Rush", () => {
    const t = d({ me: { hand: ["CP03-029"], faceUpEvolveDeck: ["CP03-087"], playPoints: 0 } });
    expect(t.canPlay("CP03-029")).toBe(true);
    t.play("CP03-029");
    expect([t.game.reader().faceDownEvolveDeck(0).length, t.keywords("CP03-029")]).toEqual([1, ["rush"]]);
  });

  it("030 Barcgal — discarded by a Royal Paladin card's ability: may go to the EX area; Last Words: draw", () => {
    const t = d({ me: { hand: ["CP03-036", "CP03-030"], deck: ["V1"], playPoints: 1 } }).play("CP03-036").yes().yes();
    expect([t.ex(), t.hand()]).toEqual([["CP03-030"], ["V1"]]);
    expect(d({ me: { field: ["CP03-030"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").hand()).toEqual(["V1"]);
  });

  it("031 Miru Biru / 036 Margal — Fanfare, reveal / discard a Royal Paladin card: draw", () => {
    expect(d({ me: { hand: ["CP03-031", "CP03-036"], deck: ["V1"], playPoints: 1 } }).play("CP03-031").yes().hand()).toEqual(["CP03-036", "V1"]);
    const m = d({ me: { hand: ["CP03-036", "CP03-031"], deck: ["V1"], playPoints: 1 } }).play("CP03-036").yes();
    expect([m.hand(), m.cemetery()]).toEqual([["V1"], ["CP03-031"]]);
  });

  it("032 Young Pegasus Knight — a Royal Paladin follower costing 2 or less from the top 3", () => {
    expect(d({ me: { hand: ["CP03-032"], deck: ["V1", "CP03-036", "V3"], playPoints: 3 } }).play("CP03-032").pick("CP03-036").order().field()).toEqual([
      "CP03-032",
      "CP03-036",
    ]);
  });

  it("033 Toypugal — Fanfare: +2/+2, Rush and Assail to a Vanguard follower costing 4 or more", () => {
    const t = d({ me: { hand: ["CP03-033"], field: ["CP03-024"], playPoints: 2 } }).play("CP03-033");
    expect([t.stats("CP03-024"), t.keywords("CP03-024")]).toEqual([[5, 5], ["rush", "assail"]]);
  });

  it("034 Pongal — Ride (1): +1/+1, may take the top card; a Royal Paladin card: 1 to the enemy leader", () => {
    const t = d({ me: { field: ["CP03-034"], evolveDeck: [DP], deck: ["CP03-036"], playPoints: 1 } }).activate("CP03-034").pick("CP03-036");
    expect([t.stats("CP03-034"), t.leader("opp")]).toEqual([[3, 3], 19]);
  });

  it("035 Future Knight, Llew — Fanfare, discard a Vanguard card: a Blaster Blade (none in the supported sets yet)", () => {
    const t = d({ me: { hand: ["CP03-035", "CP03-031"], deck: ["V1"], playPoints: 2 } }).play("CP03-035").yes();
    expect([t.cemetery(), t.hand()]).toEqual([["CP03-031"], []]);
  });

  it("037 Flogal / 038 Elaine — end phase: refresh this; Ward, Fanfare: leader +2", () => {
    expect(d({ me: { field: [{ card: "CP03-037", engaged: true }] }, opp: { deck: ["V1"] } }).end().engaged("CP03-037")).toBe(false);
    expect(d({ me: { hand: ["CP03-038"], playPoints: 2 } }).play("CP03-038").none().leader()).toBe(22);
  });

  it("039 Starlight Unicorn — a follower of yours performs a drive check: it gets +1/+0", () => {
    const t = d({ me: { field: ["CP03-039", "CP03-086"], deck: ["V1"] } }).attack("CP03-086", "opp:leader");
    expect([t.stats("CP03-086"), t.leader("opp")]).toEqual([[4, 3], 16]);
  });

  it("040 Knight of Truth, Gordon — Quick; 3 damage, or your leader's next damage this turn is 5 less", () => {
    expect(d({ me: { hand: ["CP03-040"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP03-040").choose("1").stats("opp:V5")).toEqual([5, 2]);
    // Without an enemy follower only (2) can be chosen, so it is chosen automatically.
    const t = d({ me: { hand: ["CP03-040", "CP02-076", "CP02-076"], deck: ["V1", "V1", "V1", "V1"], playPoints: 8 } }).play("CP03-040");
    expect(t.play("CP02-076").leader()).toBe(20);
    expect(t.play("CP02-076").leader()).toBe(18);
  });

  it("041 Wingal Brave — Starting Amulet; act, engage and bury, with a Royal Paladin follower: draw, then discard", () => {
    const t = d({ me: { field: ["CP03-041", "CP03-031"], hand: ["V3"], deck: ["V1"] } }).activate("CP03-041").pick("V3");
    expect([t.hand(), t.field()]).toEqual([["V1"], ["CP03-031"]]);
    expect(d({ me: { field: ["CP03-041", "V1"] } }).canActivate("CP03-041")).toBe(false);
  });
});
