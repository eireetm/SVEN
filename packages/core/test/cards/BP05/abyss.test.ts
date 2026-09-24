import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP05 Abysscraft (069–085). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; QUICK-SAC destroys a
// follower of yours (0). BP05-069 Valnareik is a Demon (魔界) follower without Fanfare.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ten = (card: string) => Array<string>(10).fill(card);

describe("BP05 Abysscraft", () => {
  it("069 Valnareik — Storm while Sanguine; Strike: damage equal to your leader's defense losses, +2/+2 at 7 defense", () => {
    const t = d({ me: { hand: ["BP05-080", "BP05-069"], playPoints: 4 } }).play("BP05-080").play("BP05-069");
    expect(t.keywords("BP05-069")).toEqual(["storm"]);
    t.attack("BP05-069", "opp:leader");
    expect([t.leader(), t.leader("opp")]).toEqual([19, 17]);
    const seven = d({ me: { hand: ["BP05-080", "BP05-069"], leaderDefense: 8, playPoints: 4 } });
    seven.play("BP05-080").play("BP05-069").attack("BP05-069", "opp:leader");
    expect([seven.leader(), seven.leader("opp"), seven.stats("BP05-069")]).toEqual([7, 15, [4, 4]]);
    expect(d({ me: { hand: ["BP05-069"] } }).play("BP05-069").keywords("BP05-069")).toEqual([]);
  });

  it("070 / 071 Rulenye — Necrocharge (10): destroy an enemy follower costing 3 or less; evolved: the opponent discards at random", () => {
    const t = d({ me: { hand: ["BP05-070"], cemetery: ten("V1") }, opp: { field: ["V3", "V5"] } }).play("BP05-070");
    expect(t.field("opp")).toEqual(["V5"]);
    expect(d({ me: { hand: ["BP05-070"] }, opp: { field: ["V3"] } }).play("BP05-070").field("opp")).toEqual(["V3"]);
    const evo = d({ me: { field: ["BP05-070"], evolveDeck: ["BP05-071"], playPoints: 1 }, opp: { hand: ["V1"] } }).evolve("BP05-070");
    expect([evo.hand("opp"), evo.cemetery("opp")]).toEqual([[], ["V1"]]);
  });

  it("072 Apostle of Lust — engage and -1 defense: a follower costing 2 or less from the cemetery; Demons entering heal 1", () => {
    const t = d({ me: { field: ["BP05-072"], cemetery: ["BP05-069", "V3"] } }).activate("BP05-072");
    expect([t.field(), t.leader(), t.engaged("BP05-072")]).toEqual([["BP05-072", "BP05-069"], 20, true]);
    const plain = d({ me: { field: ["BP05-072"], cemetery: ["V2"] } }).activate("BP05-072");
    expect([plain.field(), plain.leader()]).toEqual([["BP05-072", "V2"], 19]);
  });

  it("073 / 074 Apostle of Silence — end phase: 3 to the enemy leader if their hand has 3 or less; evolved: 3 damage or destroy", () => {
    const t = d({ me: { field: ["BP05-073"] }, opp: { hand: ["V1", "V1", "V1"], deck: ["V1"] } }).end();
    expect(t.leader("opp")).toBe(17);
    const full = d({ me: { field: ["BP05-073"] }, opp: { hand: ["V1", "V1", "V1", "V1"], deck: ["V1"] } }).end();
    expect(full.leader("opp")).toBe(20);
    const evo = d({ me: { field: ["BP05-073"], evolveDeck: ["BP05-074"], playPoints: 1 }, opp: { field: ["V5"], hand: ["V1"] } });
    expect(evo.evolve("BP05-073").field("opp")).toEqual([]);
    const big = d({
      me: { field: ["BP05-073"], evolveDeck: ["BP05-074"], playPoints: 1 },
      opp: { field: ["V5"], hand: ["V1", "V1", "V1", "V1"] },
    });
    expect(big.evolve("BP05-073").stats("opp:V5")).toEqual([5, 2]);
  });

  it("075 Disciple of Lust — Fanfare and Strike: 1 damage to each leader", () => {
    const t = d({ me: { hand: ["BP05-075"] } }).play("BP05-075");
    expect([t.leader(), t.leader("opp")]).toEqual([19, 19]);
    const s = d({ me: { field: ["BP05-075"] } }).attack("BP05-075", "opp:leader");
    expect([s.leader(), s.leader("opp")]).toEqual([19, 18]);
  });

  it("076 / 077 Masked Puppet — a Puppet into the EX area; +1/+0 when a follower of yours goes to the cemetery on your turn", () => {
    const t = d({ me: { hand: ["BP05-076", "QUICK-SAC"], field: ["V1"] } }).play("BP05-076");
    expect(t.ex()).toEqual(["BP05-T03"]);
    t.play("QUICK-SAC").pick("V1");
    expect(t.stats("BP05-076")).toEqual([3, 3]);
    const evo = d({ me: { field: ["BP05-076"], evolveDeck: ["BP05-077"], playPoints: 1 } }).evolve("BP05-076");
    expect(evo.field()).toEqual(["BP05-076", "BP05-T03", "BP05-T03"]);
  });

  it("078 Wings of Lust — up to 2 options; each costs your leader 1 defense, counted separately", () => {
    const t = d({ me: { hand: ["BP05-078"], deck: ["V2"] }, opp: { field: ["V5"] } }).play("BP05-078");
    expect(t.decision?.type === "choose" ? t.decision.options.map((o) => o.id) : []).toEqual(["damage", "draw"]);
    t.choose("damage", "draw");
    expect([t.stats("opp:V5"), t.leader(), t.game.reader().leaderDefenseLostThisTurn(0), t.cemetery()]).toEqual([
      [5, 3],
      18,
      2,
      ["V2", "BP05-078"],
    ]);
    const rush = d({ me: { hand: ["BP05-078", "V1"], playPoints: 2 } }).play("V1").play("BP05-078").choose("rush");
    expect([rush.keywords("V1"), rush.leader()]).toEqual([["rush"], 19]);
  });

  it("079 Silent Purge — destroy an enemy follower; its controller discards at random", () => {
    const t = d({ me: { hand: ["BP05-079"], playPoints: 4 }, opp: { field: ["V5"], hand: ["V1"] } }).play("BP05-079");
    expect([t.field("opp"), t.hand("opp"), t.cemetery("opp")]).toEqual([[], [], ["V5", "V1"]]);
  });

  it("080 / 081 Servant of Lust — 1 to your leader; evolved: pay 1 defense for damage equal to this turn's defense losses", () => {
    const t = d({ me: { hand: ["BP05-080"], evolveDeck: ["BP05-081"] }, opp: { field: ["V5"] } });
    t.play("BP05-080").evolve("BP05-080").yes();
    expect([t.leader(), t.stats("opp:V5")]).toEqual([18, [5, 3]]);
  });

  it("082 Servant of Silence — when an opponent discards: 2 to their leader and mill 2 of yours", () => {
    const t = d({ me: { field: ["BP05-082"], hand: ["BP05-079"], deck: ["V1", "V1", "V1"], playPoints: 4 }, opp: { field: ["V1"], hand: ["V2"] } });
    t.play("BP05-079");
    expect([t.leader("opp"), t.cemetery()]).toEqual([18, ["BP05-079", "V1", "V1"]]);
  });

  it("083 Hamelin — another token of the same name as one in your EX area", () => {
    expect(d({ me: { hand: ["BP05-083"], ex: ["BP05-T03"] } }).play("BP05-083").ex()).toEqual(["BP05-T03", "BP05-T03"]);
  });

  it("084 Embracing Wings — destroy, 2 to your leader, and up to 1 Valnareik back from the cemetery", () => {
    const t = d({ me: { hand: ["BP05-084"], cemetery: ["BP05-069"] }, opp: { field: ["V5"] } }).play("BP05-084").pick("BP05-069");
    expect([t.field("opp"), t.leader(), t.hand()]).toEqual([[], 18, ["BP05-069"]]);
  });

  it("085 Thundering Roar — one option, or up to two with Necrocharge (10)", () => {
    const t = d({ me: { hand: ["BP05-085"], cemetery: ten("V1") }, opp: { field: ["V5"], hand: ["V1"] } }).play("BP05-085");
    t.choose("discard", "damage");
    expect([t.hand("opp"), t.stats("opp:V5")]).toEqual([[], [5, 2]]);
    const one = d({ me: { hand: ["BP05-085"] }, opp: { field: ["V5"], hand: ["V1"] } }).play("BP05-085");
    expect(() => one.choose("discard", "damage")).toThrow();
  });
});
