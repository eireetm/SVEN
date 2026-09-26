import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP11 Dragoncraft (052–068). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC
// destroys one of your followers. Overflow is max play points 7 or more. BP11-059, 066, 058 are
// Dragoncraft cards that cost 7 or more; BP11-063 / 067 are Marine (海洋) cards; BP11-065 is a 1-cost
// Wasteland follower. Tokens: BP11-T03 Dutiful Steed, BP11-T04 Bullet Bike.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const OVERFLOW = { playPoints: 7, maxPlayPoints: 7 };
const STEED = "BP11-T03";
const BIKE = "BP11-T04";

describe("BP11 Dragoncraft", () => {
  it("052 Reggie — Storm with Overflow; Fanfare summons a Wasteland follower that costs 2 or less from the cemetery", () => {
    const t = d({ me: { hand: ["BP11-052"], cemetery: ["BP11-065"], ...OVERFLOW } }).play("BP11-052");
    expect([t.field(), t.keywords("BP11-052")]).toEqual([["BP11-052", "BP11-065"], ["storm"]]);
    expect(d({ me: { field: ["BP11-052"], playPoints: 6, maxPlayPoints: 6 } }).keywords("BP11-052")).toEqual([]);
  });

  it("053 Reggie (Evolved) — On Evolve other Wasteland followers +1 attack", () => {
    const t = d({ me: { field: ["BP11-052", "BP11-065", "V1"], evolveDeck: ["BP11-053"], playPoints: 1 } }).evolve("BP11-052");
    expect([t.stats("BP11-052"), t.stats("BP11-065"), t.stats("V1")]).toEqual([[3, 3], [3, 2], [2, 2]]);
  });

  it("054 Resplendent Phoenix — Ward; Fanfare (2) with Overflow: the top card after a shuffle into the EX area at cost 0; Last Words leader +2", () => {
    const t = d({ me: { hand: ["BP11-054"], deck: ["V5"], ...OVERFLOW } }).play("BP11-054").none().yes();
    expect([t.ex(), t.pp(), t.keywords("BP11-054")]).toEqual([["V5"], 2, ["ward"]]);
    t.play("V5@ex");
    expect([t.field(), t.pp()]).toEqual([["BP11-054", "V5"], 2]);
    expect(d({ me: { field: ["BP11-054"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").leader()).toBe(22);
  });

  it("055 / 056 Georgius — Fanfare 2 to an enemy follower and its leader with Overflow; evolved: destroys each enemy follower with 3 defense or less", () => {
    const t = d({ me: { hand: ["BP11-055"], ...OVERFLOW }, opp: { field: ["V5"] } }).play("BP11-055");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 18]);
    const low = d({ me: { hand: ["BP11-055"], playPoints: 4, maxPlayPoints: 4 }, opp: { field: ["V5"] } }).play("BP11-055");
    expect([low.stats("opp:V5"), low.leader("opp")]).toEqual([[5, 5], 20]);
    const evo = d({ me: { field: ["BP11-055"], evolveDeck: ["BP11-056"], playPoints: 2 }, opp: { field: ["V1", "V2", "V3", "V5"] } }).evolve("BP11-055");
    expect(evo.field("opp")).toEqual(["V3", "V5"]);
  });

  it("057 Balefire Wrenchsmith — a Dutiful Steed; during your turn another Wasteland card entering your field deals 1", () => {
    const t = d({ me: { hand: ["BP11-057"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-057");
    expect([t.field(), t.stats("opp:V5")]).toEqual([["BP11-057", STEED], [5, 4]]);
  });

  it("058 Dragon-Devouring Dread — Fanfare banishes up to 1 enemy follower per big Dragoncraft card in the cemetery; from the hand (3) and discard: max PP +1 and a draw", () => {
    const t = d({ me: { hand: ["BP11-058"], cemetery: ["BP11-059", "BP11-066"], playPoints: 9 }, opp: { field: ["V1", "V3", "V5"] } });
    t.play("BP11-058").pick("opp:V1", "opp:V5");
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([["V3"], ["V1", "V5"]]);
    const act = d({ me: { hand: ["BP11-058", "BP11-059"], deck: ["V1"], playPoints: 3, maxPlayPoints: 5 } }).activate("BP11-058");
    expect([act.hand(), act.cemetery(), act.game.state.players[0].maxPlayPoints]).toEqual([["V1"], ["BP11-058", "BP11-059"], 6]);
  });

  it("059 / 060 Azureflame Dragonewt — Fanfare 6 damage; from the hand (1) and discard: 4 damage; evolved: 6 damage", () => {
    expect(d({ me: { hand: ["BP11-059"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP11-059").field("opp")).toEqual([]);
    const act = d({ me: { hand: ["BP11-059", "BP11-066"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP11-059");
    expect([act.stats("opp:V5"), act.hand()]).toEqual([[5, 1], []]);
    const evo = d({ me: { field: ["BP11-059"], evolveDeck: ["BP11-060"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP11-059");
    expect(evo.field("opp")).toEqual([]);
  });

  it("061 Dragonfolk Artificer — a Wasteland card from the top 3 to the hand", () => {
    const t = d({ me: { hand: ["BP11-061"], deck: ["V1", "BP11-065", "V3"], playPoints: 2 } }).play("BP11-061").pick("BP11-065").order();
    expect(t.hand()).toEqual(["BP11-065"]);
  });

  it("062 Draconic Call — Quick; up to 2 big Dragoncraft cards from the top 5 to the hand", () => {
    const t = d({ me: { hand: ["BP11-062"], deck: ["BP11-059", "V1", "BP11-066", "BP11-058", "V3"], playPoints: 2 } });
    t.play("BP11-062").pick("BP11-059", "BP11-066").order();
    expect(t.hand()).toEqual(["BP11-059", "BP11-066"]);
  });

  it("063 / 064 Mermaid Guide — Storm with 5 Marine cards in the cemetery; evolved: discard a Marine card to draw 2", () => {
    expect(d({ me: { field: ["BP11-063"], cemetery: Array<string>(5).fill("BP11-067") } }).keywords("BP11-063")).toEqual(["storm"]);
    expect(d({ me: { field: ["BP11-063"], cemetery: Array<string>(4).fill("BP11-067") } }).keywords("BP11-063")).toEqual([]);
    const evo = d({ me: { field: ["BP11-063"], evolveDeck: ["BP11-064"], hand: ["BP11-067"], deck: ["V1", "V3"], playPoints: 1 } }).evolve("BP11-063").yes();
    expect([evo.hand(), evo.cemetery()]).toEqual([["V1", "V3"], ["BP11-067"]]);
  });

  it("065 Wyrmfire Engineer — Last Words summons a Bullet Bike", () => {
    expect(d({ me: { field: ["BP11-065"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").field()).toEqual([BIKE]);
  });

  it("066 Pumpkin Dragon — Ward; Fanfare leader +5 and draw 2; from the hand (2) and discard: leader +5", () => {
    const t = d({ me: { hand: ["BP11-066"], deck: ["V1", "V3"], playPoints: 8 } }).play("BP11-066").none();
    expect([t.leader(), t.hand(), t.keywords("BP11-066")]).toEqual([25, ["V1", "V3"], ["ward"]]);
    const act = d({ me: { hand: ["BP11-066", "BP11-058"], playPoints: 2 } }).activate("BP11-066");
    expect([act.leader(), act.hand()]).toEqual([25, []]);
  });

  it("067 Wavecrest Angler — a Marine card from the top 3 into the EX area", () => {
    const t = d({ me: { hand: ["BP11-067"], deck: ["V1", "BP11-063", "V3"], playPoints: 2 } }).play("BP11-067").pick("BP11-063").order();
    expect(t.ex()).toEqual(["BP11-063"]);
  });

  it("068 Thunderous Roar — Quick; 3 damage, or 4 and a draw when a big Dragoncraft card was discarded", () => {
    const plain = d({ me: { hand: ["BP11-068", "BP11-059"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-068").choose("normal");
    expect([plain.stats("opp:V5"), plain.hand()]).toEqual([[5, 2], ["BP11-059"]]);
    const paid = d({ me: { hand: ["BP11-068", "BP11-059"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-068").choose("discard");
    expect([paid.stats("opp:V5"), paid.hand(), paid.cemetery()]).toEqual([[5, 1], ["V1"], ["BP11-059", "BP11-068"]]);
    // Without a big Dragoncraft card in the hand, it is played normally without a choice.
    expect(d({ me: { hand: ["BP11-068"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-068").stats("opp:V5")).toEqual([5, 2]);
  });
});
