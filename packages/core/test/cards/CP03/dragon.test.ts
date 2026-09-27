import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP03 Dragoncraft (063–082), Cardfight!! Vanguard (Kagero). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP03-127 is a
// Drive Point. Kagero cards: CP03-080 Irontail Dragon (1c 1/2), CP03-077 Gatling Claw Dragon (2c 2/3), CP03-075 Kimnara (a
// 3-cost Quick spell: 6 damage). CP03-086 Blaster Dark has Single Drive. CSD03b-001 is Dragonic Overlord.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const DP = "CP03-127";

describe("CP03 Dragoncraft", () => {
  it("063 Dragonic Overlord the End — Strike, pay 3 and discard another The End: refresh; act, banish 5 Kagero cards: destroy each other follower", () => {
    const t = d({ me: { field: ["CP03-063"], hand: ["CP03-063"], deck: ["V1", "V1"], playPoints: 3 } }).attack("CP03-063", "opp:leader");
    t.flush().yes().flush();
    expect([t.engaged("CP03-063"), t.pp(), t.hand(), t.leader("opp")]).toEqual([false, 0, [], 14]);
    const a = d({ me: { field: ["CP03-063", "V1"], cemetery: n(5, "CP03-080") }, opp: { field: ["V5"] } }).activate("CP03-063");
    expect([a.field(), a.field("opp"), a.cemetery()]).toEqual([["CP03-063"], [], ["V1"]]);
    // Fanfare with a Dragonic Overlord in the cemetery: recover 1 play point.
    expect(d({ me: { hand: ["CP03-063"], cemetery: ["CSD03b-001"], playPoints: 7 } }).play("CP03-063").none().pp()).toBe(1);
    expect(d({ me: { hand: ["CP03-063"], cemetery: ["CP03-063"], playPoints: 7 } }).play("CP03-063").none().pp()).toBe(0);
  });

  it("064 Seal Dragon, Blockade — an opponent's spell during your turn: 2 to their leader; your Kagero card's ability damage to an enemy follower: draw, once per turn", () => {
    const t = d({ me: { field: ["CP03-064", "V1"] }, opp: { hand: ["CP03-075"], playPoints: 3 } }).attack("V1", "opp:leader").quick("opp:CP03-075").pick("CP03-064");
    expect([t.field(), t.leader("opp")]).toEqual([["V1"], 16]);
    const k = d({ me: { field: ["CP03-064"], hand: ["CP03-075", "CP03-075"], deck: ["V1", "V1"], playPoints: 6 }, opp: { field: ["V5", "V5"] } });
    k.play("CP03-075").pick("opp:V5").play("CP03-075");
    expect([k.field("opp"), k.hand()]).toEqual([[], ["V1"]]);
  });

  it("065 Burning Horn Dragon — Rush; Fanfare with an Overlord follower: +2/+2; a follower of yours drive-checks: 1 damage", () => {
    expect(d({ me: { hand: ["CP03-065"], field: ["CP03-063"], playPoints: 2 } }).play("CP03-065").stats("CP03-065")).toEqual([5, 4]);
    expect(d({ me: { field: ["CP03-065", "CP03-086"], deck: ["V1"] } }).attack("CP03-086", "opp:leader").leader("opp")).toBe(16);
  });

  it("066 / 067 Blazing Core Dragon — evolve (1) banishing an Irontail Dragon and a Gatling Claw Dragon; Blazing Flare: 5 damage and 3 to its leader", () => {
    const t = d({ me: { field: ["CP03-066"], evolveDeck: ["CP03-067"], cemetery: ["CP03-080", "CP03-077"], playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("CP03-066");
    expect([t.field("opp"), t.leader("opp"), t.zone("me", "banished").sort(), t.keywords("CP03-066")]).toEqual([
      [],
      17,
      ["CP03-077", "CP03-080"],
      ["twinDrive"],
    ]);
    expect(d({ me: { field: ["CP03-066"], evolveDeck: ["CP03-067"], cemetery: ["CP03-080"], playPoints: 2 } }).canEvolve("CP03-066")).toBe(false);
  });

  it("068 Dragonic Executioner — Rush; Fanfare, discard a Kagero card: draw 2", () => {
    const t = d({ me: { hand: ["CP03-068", "CP03-080"], deck: ["V1", "V1"], playPoints: 4 } }).play("CP03-068").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["V1", "V1"], ["CP03-080"]]);
  });

  it("069 Vortex Dragon — Fanfare, banish 3 Kagero cards from your cemetery: destroy up to 2 enemy followers", () => {
    const t = d({ me: { hand: ["CP03-069"], cemetery: n(3, "CP03-080"), playPoints: 5 }, opp: { field: ["V1", "V5"] } }).play("CP03-069").yes();
    t.pick("opp:V1", "opp:V5");
    expect([t.field("opp"), t.cemetery()]).toEqual([[], []]);
  });

  it("070 Flame of Promise, Aermo — Fanfare, reveal an Overlord follower from your hand: draw", () => {
    expect(d({ me: { hand: ["CP03-070", "CP03-063"], deck: ["V1"], playPoints: 1 } }).play("CP03-070").yes().hand()).toEqual(["CP03-063", "V1"]);
  });

  it("071 Bellicosity Dragon — Ride (1): 4 damage divided between up to 2, +1/+1; Fanfare: leader +2, draw", () => {
    const r = d({ me: { field: ["CP03-071"], evolveDeck: [DP], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-071").pick("opp:V5");
    expect([r.stats("opp:V5"), r.stats("CP03-071")]).toEqual([[5, 1], [5, 5]]);
    const f = d({ me: { hand: ["CP03-071"], deck: ["V1"], playPoints: 5 } }).play("CP03-071");
    expect([f.leader(), f.hand()]).toEqual([22, ["V1"]]);
  });

  it("072 Prowling Dragon, Striken — can't attack; after a resolved Trigger of your drive check it loses all abilities this turn", () => {
    const t = d({ me: { universe: "vanguard", field: ["CP03-072", "CP03-086"], deck: ["CP03-079"], leaderDefense: 10 } });
    expect(t.attackTargets("CP03-072")).toEqual([]);
    t.attack("CP03-086", "opp:leader").yes();
    expect([t.leader(), t.attackTargets("CP03-072")]).toEqual([13, ["opp:leader"]]);
  });

  it("073 Dragon Monk, Gojo — Ride (1): +1/+1; a Kagero follower from the top 2, up to 2 with Overflow", () => {
    const t = d({ me: { field: ["CP03-073"], evolveDeck: [DP], deck: ["CP03-080", "CP03-077"], playPoints: 1, maxPlayPoints: 7 } }).activate("CP03-073");
    t.pick("CP03-080", "CP03-077");
    expect([t.hand().sort(), t.stats("CP03-073")]).toEqual([["CP03-077", "CP03-080"], [3, 3]]);
  });

  it("074 Yaksha / 075 Kimnara / 076 Tahr — destroy an amulet or 2 to the leader; Quick 6 damage; Rush, Assail, Overflow: 2 to the leader", () => {
    expect(d({ me: { hand: ["CP03-074"], playPoints: 3 } }).play("CP03-074").leader("opp")).toBe(18);
    expect(d({ me: { hand: ["CP03-075"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP03-075").field("opp")).toEqual([]);
    const tahr = d({ me: { hand: ["CP03-076"], playPoints: 2, maxPlayPoints: 7 } }).play("CP03-076");
    expect([tahr.leader("opp"), tahr.keywords("CP03-076")]).toEqual([18, ["rush", "assail"]]);
  });

  it("077 Gatling Claw Dragon — act, engage: draw, only after an enemy follower went from the field to the cemetery this turn", () => {
    const t = d({ me: { field: ["CP03-077"], hand: ["CP03-075"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } });
    expect(t.canActivate("CP03-077")).toBe(false);
    t.play("CP03-075").activate("CP03-077");
    expect(t.hand()).toEqual(["V1"]);
  });

  it("078 Lizard Soldier, Ganlu — act, engage with another Kagero follower: 1 damage; act (2): refresh, but it can't attack enemies this turn", () => {
    const t = d({ me: { field: ["CP03-078", "CP03-080"], playPoints: 2 }, opp: { field: ["V5"] } }).activate("CP03-078");
    expect(t.stats("opp:V5")).toEqual([5, 4]);
    t.activate("CP03-078");
    expect([t.engaged("CP03-078"), t.attackTargets("CP03-078"), t.pp()]).toEqual([false, [], 0]);
    expect(d({ me: { field: ["CP03-078", "V1"], playPoints: 0 }, opp: { field: ["V5"] } }).canActivate("CP03-078")).toBe(false);
  });

  it("079 Genjo / 080 Irontail Dragon — Ward, leader +1 (+2 with Overflow); act, engage: +1/+0", () => {
    expect(d({ me: { hand: ["CP03-079"], playPoints: 1 } }).play("CP03-079").none().leader()).toBe(21);
    expect(d({ me: { hand: ["CP03-079"], playPoints: 1, maxPlayPoints: 7 } }).play("CP03-079").none().leader()).toBe(22);
    expect(d({ me: { field: ["CP03-080"] } }).activate("CP03-080").stats("CP03-080")).toEqual([2, 2]);
  });

  it("081 Flame of Hope, Aermo — Fanfare: 2 damage with Overflow; once on your turn, an enemy follower to the cemetery: draw, then discard", () => {
    const t = d({ me: { hand: ["CP03-081"], deck: ["V3"], playPoints: 1, maxPlayPoints: 7 }, opp: { field: ["V1"] } }).play("CP03-081");
    expect([t.field("opp"), t.cemetery(), t.hand()]).toEqual([[], ["V3"], []]);
    expect(d({ me: { hand: ["CP03-081"], deck: ["V3"], playPoints: 1 }, opp: { field: ["V1"] } }).play("CP03-081").field("opp")).toEqual(["V1"]);
  });

  it("082 Lizard Soldier, Conroe — Starting Amulet; act, engage and bury, with a Kagero follower: 1 damage", () => {
    const t = d({ me: { field: ["CP03-082", "CP03-080"] }, opp: { field: ["V5"] } }).activate("CP03-082");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 4], ["CP03-080"]]);
  });
});
