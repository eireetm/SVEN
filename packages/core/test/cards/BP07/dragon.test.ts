import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP07 Dragoncraft (052–068). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; QUICK-SAC destroys a follower of
// yours (0). BP07-T03 Naterran Great Tree is a Natura token amulet. Overflow: max PP 7 or more.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TREE = "BP07-T03";
const natura = (n: number) => Array<string>(n).fill("BP07-010");

describe("BP07 Dragoncraft", () => {
  it("052 Valdain — evolve for 0 with 10 Natura cards in the cemetery; a Natura card from the top 3, bury the rest", () => {
    expect(d({ me: { field: ["BP07-052"], evolveDeck: ["BP07-053"], cemetery: natura(9), playPoints: 0 } }).canEvolve("BP07-052")).toBe(false);
    expect(d({ me: { field: ["BP07-052"], evolveDeck: ["BP07-053"], cemetery: natura(10), playPoints: 0 } }).canEvolve("BP07-052")).toBe(true);
    const t = d({ me: { hand: ["BP07-052"], deck: ["V1", "BP07-013", "V3", "V5"], playPoints: 4 } }).play("BP07-052").pick("BP07-013");
    expect([t.hand(), t.cemetery(), t.zone("me", "deck")]).toEqual([["BP07-013"], ["V1", "V3"], ["V5"]]);
  });

  it("053 Valdain (Evolved) — 4 damage and a Shadow's Corrosion into the EX area, or play one from the cemetery for 0 (it then goes into the EX area)", () => {
    const evo = { card: "BP07-052" };
    const one = d({ me: { field: [evo], evolveDeck: ["BP07-053"], deck: ["V1", "BP07-058"], cemetery: ["BP07-058"], playPoints: 2 }, opp: { field: ["V5"] } });
    one.evolve("BP07-052").choose("damage").pick("BP07-058");
    expect([one.stats("opp:V5"), one.ex()]).toEqual([[5, 1], ["BP07-058"]]);
    const two = d({ me: { field: [evo], evolveDeck: ["BP07-053"], cemetery: ["BP07-058"], playPoints: 2 }, opp: { field: ["V5", "V1"] } });
    two.evolve("BP07-052").choose("play").pick("opp:V1");
    expect([two.field("opp"), two.ex(), two.cemetery()]).toEqual([["V5"], ["BP07-058"], []]);
    // No enemy follower: only (2) can be chosen; the Corrosion is selected but can't be played.
    const none = d({ me: { field: [evo], evolveDeck: ["BP07-053"], cemetery: ["BP07-058"], playPoints: 2 } }).evolve("BP07-052");
    expect([none.cemetery(), none.decision?.type]).toEqual([["BP07-058"], "mainPhase"]);
  });

  it("054 Neptune — Ward; up to 2 other Marine followers from the top 5; may summon a Marine follower costing 5 or less from the hand +2/+2", () => {
    const t = d({ me: { hand: ["BP07-054"], deck: ["BP07-059", "BP07-054", "BP07-067", "V1", "V3"], playPoints: 7 } });
    t.play("BP07-054").none().pick("BP07-059", "BP07-067").order().pick("BP07-067");
    expect([t.field(), t.stats("BP07-067"), t.hand(), t.zone("me", "deck")]).toEqual([
      ["BP07-054", "BP07-067"],
      [5, 4],
      ["BP07-059"],
      ["BP07-054", "V1", "V3"],
    ]);
  });

  it("055 Wildfire Tyrannosaur — discarded: pay 1 for 3 damage (or not); banish a Tree: 3 damage to each enemy follower", () => {
    const paid = d({ me: { hand: ["BP07-078", "BP07-055"], deck: ["V1"] }, opp: { field: ["V3"] } }).play("BP07-078").yes().yes();
    expect([paid.stats("opp:V3"), paid.pp()]).toEqual([[3, 1], 0]);
    const unpaid = d({ me: { hand: ["BP07-078", "BP07-055"], deck: ["V1"] }, opp: { field: ["V3"] } }).play("BP07-078").yes().no();
    expect([unpaid.stats("opp:V3"), unpaid.pp()]).toEqual([[3, 4], 1]);
    const act = d({ me: { field: ["BP07-055", TREE], deck: ["V1"] }, opp: { field: ["V3", "V5"] } }).activate("BP07-055");
    expect([act.stats("opp:V3"), act.stats("opp:V5")]).toEqual([[3, 1], [5, 2]]);
  });

  it("056 / 057 Marion — with Overflow a Dragoncraft follower from the top 3 into the EX area; evolved: another Dragoncraft follower on the field or in the EX area +1/+1", () => {
    const t = d({ me: { hand: ["BP07-056"], deck: ["V1", "BP07-059", "V3"], maxPlayPoints: 7 } }).play("BP07-056").pick("BP07-059").order();
    expect(t.ex()).toEqual(["BP07-059"]);
    expect(d({ me: { hand: ["BP07-056"], deck: ["V1", "BP07-059", "V3"] } }).play("BP07-056").ex()).toEqual([]);
    const evo = d({ me: { field: ["BP07-056", "BP07-067"], evolveDeck: ["BP07-057"], ex: ["BP07-059"], playPoints: 3 } }).evolve("BP07-056").pick("BP07-059");
    evo.play("BP07-059");
    expect(evo.stats("BP07-059")).toEqual([3, 4]); // kept from the EX area
  });

  it("058 Shadow's Corrosion — not from the EX area; in the EX area, end phase: 1 per 5 Natura cards; 4 damage, into the EX area with Valdain", () => {
    expect(d({ me: { ex: ["BP07-058"], playPoints: 3 }, opp: { field: ["V5"] } }).canPlay("BP07-058")).toBe(false);
    const end = d({ me: { ex: ["BP07-058", "BP07-058"], cemetery: natura(10) }, opp: { deck: ["V1"] } }).end().flush();
    expect(end.leader("opp")).toBe(16);
    const t = d({ me: { hand: ["BP07-058"], field: ["BP07-052"] }, opp: { field: ["V5"] } }).play("BP07-058");
    expect([t.stats("opp:V5"), t.ex(), t.cemetery()]).toEqual([[5, 1], ["BP07-058"], []]);
    expect(d({ me: { hand: ["BP07-058"] }, opp: { field: ["V5"] } }).play("BP07-058").cemetery()).toEqual(["BP07-058"]);
  });

  it("059 Bubbleborne Mermaid — leader +1 per Marine follower on your field", () => {
    expect(d({ me: { hand: ["BP07-059"], field: ["BP07-067", "V1"] } }).play("BP07-059").leader()).toBe(22);
  });

  it("060 / 061 Hoarfrost Triceratops — banish a Tree: +2/+2; Last Words: a Tree; evolved: 3 damage", () => {
    // The banished Tree draws V1 and discards a card.
    const t = d({ me: { hand: ["BP07-060", "QUICK-SAC"], field: [TREE], deck: ["V1"], playPoints: 4 } }).play("BP07-060").yes().pick("V1");
    expect(t.stats("BP07-060")).toEqual([5, 5]);
    t.play("QUICK-SAC");
    expect(t.field()).toEqual([TREE]);
    const evo = d({ me: { field: ["BP07-060"], evolveDeck: ["BP07-061"], playPoints: 1 }, opp: { field: ["V3"] } }).evolve("BP07-060");
    expect(evo.stats("opp:V3")).toEqual([3, 1]);
  });

  it("062 Whirlwind Pteranodon — banish a Tree: max PP +1; Last Words: a Tree", () => {
    const t = d({ me: { hand: ["BP07-062", "QUICK-SAC"], field: [TREE], deck: ["V1"], playPoints: 3 } }).play("BP07-062").yes().pick("V1");
    expect(t.game.state.players[0].maxPlayPoints).toBe(4);
    t.play("QUICK-SAC");
    expect(t.field()).toEqual([TREE]);
  });

  it("063 Dragonewt Needler — a Dragonewt follower attacking: 2 to the enemy leader (itself too)", () => {
    const t = d({ me: { field: ["BP07-063", "BP07-056"] } }).attack("BP07-056", "opp:leader");
    expect(t.leader("opp")).toBe(16);
    t.attack("BP07-063", "opp:leader");
    expect(t.leader("opp")).toBe(12);
  });

  it("064 Lightning Velociraptor — a Tree; with Overflow up to 2 (0 too) and Rush", () => {
    expect(d({ me: { hand: ["BP07-064"] } }).play("BP07-064").field()).toEqual(["BP07-064", TREE]);
    const t = d({ me: { hand: ["BP07-064"], maxPlayPoints: 7 } }).play("BP07-064").choose("0");
    expect([t.field(), t.keywords("BP07-064")]).toEqual([["BP07-064"], ["rush"]]);
  });

  it("065 / 066 Doting Dragoneer — with Overflow 2 damage; evolved: summon a Dragoncraft follower costing 3 or less from the cemetery", () => {
    expect(d({ me: { hand: ["BP07-065"], maxPlayPoints: 7 }, opp: { field: ["V5"] } }).play("BP07-065").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { hand: ["BP07-065"] }, opp: { field: ["V5"] } }).play("BP07-065").stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP07-065"], evolveDeck: ["BP07-066"], cemetery: ["BP07-059", "V1"], playPoints: 2 } }).evolve("BP07-065");
    expect(evo.field()).toEqual(["BP07-065", "BP07-059"]);
  });

  it("067 Boomfish — pay 2 and bury it: 3 damage to each follower and your leader", () => {
    const t = d({ me: { field: ["BP07-067", "V3"] }, opp: { field: ["V5", "V1"] } }).activate("BP07-067");
    expect([t.field(), t.field("opp"), t.leader(), t.cemetery()]).toEqual([["V3"], ["V5"], 17, ["BP07-067"]]);
  });

  it("068 Feral Aether — a Tree; with Overflow up to 3", () => {
    expect(d({ me: { hand: ["BP07-068"] } }).play("BP07-068").field()).toEqual([TREE]);
    expect(d({ me: { hand: ["BP07-068"], maxPlayPoints: 7 } }).play("BP07-068").choose("3").field()).toEqual([TREE, TREE, TREE]);
  });
});
