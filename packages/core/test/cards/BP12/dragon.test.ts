import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP12 Dragoncraft (052–068). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL a 1-cost
// spell; QUICK-SAC destroys one of your followers. Overflow is max play points 7 or more. BP11-046
// Crystal Fencer draws and discards; BP11-063 Mermaid Guide is a Marine follower; BP04-064 Star Phoenix;
// BP12-055 a 2-cost Natura Dragoncraft follower. Token: BP07-T03 Naterran Great Tree (leaving the field:
// draw, then discard).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const OVERFLOW = { playPoints: 7, maxPlayPoints: 7 };
const TREE = "BP07-T03";

describe("BP12 Dragoncraft", () => {
  it("052 Shipsbane Plesiosaurus — Fanfare banish a Tree: draw; during your turn, discarding deals 2 once per discard", () => {
    // The banished Tree draws and discards too: that discard deals 2 (to the leader, the only target).
    const t = d({ me: { hand: ["BP12-052"], field: [TREE], deck: ["V1", "V3"], playPoints: 5 } }).play("BP12-052").yes().pick("V1");
    expect([t.hand(), t.cemetery(), t.leader("opp")]).toEqual([["V3"], ["V1"], 18]);
    // Two cards discarded together: once (rulings).
    const two = d({ me: { field: ["BP12-052"], hand: ["BP12-061", "V1", "V3"], deck: ["V5", "V2"], playPoints: 5 } }).play("BP12-061").yes();
    expect([two.hand(), two.leader("opp")]).toEqual([["V5", "V2"], 18]);
  });

  it("053 Shipsbane Plesiosaurus (Evolved) — On Evolve discard a card: leader +2 (and the discard deals 2)", () => {
    const t = d({ me: { field: ["BP12-052"], evolveDeck: ["BP12-053"], hand: ["V1"], playPoints: 1 } }).evolve("BP12-052").yes();
    expect([t.leader(), t.leader("opp"), t.cemetery()]).toEqual([22, 18, ["V1"]]);
  });

  it("054 Jerva — discarded: may go into the EX area; Ward; Fanfare 6 to each other follower and the enemy leader; from the EX area (3) with Overflow: 6 damage", () => {
    expect(d({ me: { hand: ["BP11-046", "BP12-054"], deck: ["V1"], playPoints: 3 } }).play("BP11-046").pick("BP12-054").yes().ex()).toEqual(["BP12-054"]);
    const t = d({ me: { hand: ["BP12-054"], field: ["V5"], playPoints: 9 }, opp: { field: ["V5", "V3"] } }).play("BP12-054").none();
    expect([t.field(), t.field("opp"), t.leader("opp")]).toEqual([["BP12-054"], [], 14]);
    const act = d({ me: { ex: ["BP12-054"], ...OVERFLOW }, opp: { field: ["V5"] } }).activate("BP12-054");
    expect([act.field("opp"), act.cemetery(), act.pp()]).toEqual([[], ["BP12-054"], 4]);
    expect(d({ me: { ex: ["BP12-054"], playPoints: 6, maxPlayPoints: 6 }, opp: { field: ["V5"] } }).canActivate("BP12-054")).toBe(false);
  });

  it("055 / 056 Steelcap Pachycephalosaurus — Last Words a Tree; evolved: 2 damage, 4 after a discard this turn", () => {
    expect(d({ me: { field: ["BP12-055"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").field()).toEqual([TREE]);
    const t = d({ me: { field: ["BP12-055"], hand: ["BP11-046", "V3"], evolveDeck: ["BP12-056"], deck: ["V1"], playPoints: 4 }, opp: { field: ["V5"] } });
    t.play("BP11-046").pick("V3").evolve("BP12-055");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
    const plain = d({ me: { field: ["BP12-055"], evolveDeck: ["BP12-056"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP12-055");
    expect(plain.stats("opp:V5")).toEqual([5, 3]);
  });

  it("057 Giselle — with Overflow, other Marine followers have Rush and Assail; Fanfare leader +2", () => {
    expect(d({ me: { field: ["BP12-057", "BP11-063"], ...OVERFLOW } }).keywords("BP11-063")).toEqual(["rush", "assail"]);
    expect(d({ me: { field: ["BP12-057", "BP11-063"], playPoints: 6, maxPlayPoints: 6 } }).keywords("BP11-063")).toEqual([]);
    expect(d({ me: { field: ["BP12-057"], ...OVERFLOW } }).keywords("BP12-057")).toEqual([]);
    expect(d({ me: { hand: ["BP12-057"], playPoints: 1 } }).play("BP12-057").leader()).toBe(22);
  });

  it("058 Cursed Furor — Quick with Overflow; 4 damage and a Tree", () => {
    expect(d({ me: { hand: ["BP12-058"], ...OVERFLOW } }).keywords("BP12-058")).toEqual(["quick"]);
    expect(d({ me: { hand: ["BP12-058"], playPoints: 6, maxPlayPoints: 6 } }).keywords("BP12-058")).toEqual([]);
    const t = d({ me: { hand: ["BP12-058"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP12-058");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 1], [TREE]]);
  });

  it("059 / 060 Assault Dragoon — engage: a Dragoncraft follower that costs 2 or less +1/+1 and Storm; evolved: summons one from the cemetery", () => {
    const t = d({ me: { field: ["BP12-059", "BP12-055"] } }).activate("BP12-059").pick("BP12-055");
    expect([t.stats("BP12-055"), t.keywords("BP12-055"), t.engaged("BP12-059")]).toEqual([[3, 3], ["storm"], true]);
    const evo = d({ me: { field: ["BP12-059"], evolveDeck: ["BP12-060"], cemetery: ["BP12-055"], playPoints: 2 } }).evolve("BP12-059");
    expect(evo.field()).toEqual(["BP12-059", "BP12-055"]);
  });

  it("061 Petalspine Stegosaurus — discard 2: draw 2; engage with 5 Natura cards in the cemetery: 5 damage; Last Words a Tree", () => {
    const t = d({ me: { hand: ["BP12-061", "V1", "V3"], deck: ["V5", "V2"], playPoints: 5 } }).play("BP12-061").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["V5", "V2"], ["V1", "V3"]]);
    const natura = Array<string>(5).fill("BP12-055");
    expect(d({ me: { field: ["BP12-061"], cemetery: natura }, opp: { field: ["V5"] } }).activate("BP12-061").field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP12-061"], cemetery: natura.slice(1) }, opp: { field: ["V5"] } }).canActivate("BP12-061")).toBe(false);
    expect(d({ me: { field: ["BP12-061"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").field()).toEqual([TREE]);
  });

  it("062 Phoenix Howl — up to 2: 2 damage; pay X twice: up to X Star Phoenixes onto the field with Rush", () => {
    const t = d({ me: { hand: ["BP12-062"], deck: ["V1", "BP04-064", "BP04-064"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("BP12-062").choose("damage", "phoenix").yes().choose("2").pick("BP04-064", "BP04-064");
    expect([t.stats("opp:V5"), t.field(), t.keywords("BP04-064"), t.pp()]).toEqual([[5, 3], ["BP04-064", "BP04-064"], ["rush"], 0]);
    const zero = d({ me: { hand: ["BP12-062"], deck: ["BP04-064"], playPoints: 5 } }).play("BP12-062").yes().choose("0");
    expect([zero.field(), zero.pp()]).toEqual([[], 4]);
  });

  it("063 / 064 Dragoon Medic — discarded: may go into the EX area; end phase leader +1, evolved +2", () => {
    expect(d({ me: { hand: ["BP11-046", "BP12-063"], deck: ["V1"], playPoints: 3 } }).play("BP11-046").pick("BP12-063").yes().ex()).toEqual(["BP12-063"]);
    expect(d({ me: { field: ["BP12-063"] }, opp: { deck: ["V1"] } }).end().leader()).toBe(21);
    expect(d({ me: { field: [{ card: "BP12-063", evolvedInto: "BP12-064" }] }, opp: { deck: ["V1"] } }).end().leader()).toBe(22);
  });

  it("065 Rockback Ankylosaurus — Fanfare a Tree; Fanfare (1) and discard: 3 damage", () => {
    const t = d({ me: { hand: ["BP12-065", "V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP12-065").pending().yes();
    expect([t.field(), t.stats("opp:V5"), t.cemetery(), t.pp()]).toEqual([["BP12-065", TREE], [5, 2], ["V1"], 0]);
  });

  it("066 Ruinous Dragon — a Dragoncraft spell that costs 5 or less (or another spell that costs 2 or less) into the EX area at 5 less", () => {
    const t = d({ me: { hand: ["BP12-066"], deck: ["V1", "BP12-068", "KILL"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP12-066").pick("BP12-068");
    expect([t.ex(), t.pp(), t.canPlay("BP12-068@ex")]).toEqual([["BP12-068"], 0, true]);
  });

  it("067 Dragon Aficionado — with Overflow, a 1-cost Dragoncraft follower from the deck", () => {
    expect(d({ me: { hand: ["BP12-067"], deck: ["V1", "BP12-063"], ...OVERFLOW } }).play("BP12-067").pick("BP12-063").hand()).toEqual(["BP12-063"]);
    expect(d({ me: { hand: ["BP12-067"], deck: ["V1", "BP12-063"], playPoints: 6, maxPlayPoints: 6 } }).play("BP12-067").hand()).toEqual([]);
  });

  it("068 Overwhelming Crush — destroys an enemy follower and searches a Dragoncraft follower", () => {
    const t = d({ me: { hand: ["BP12-068"], deck: ["V1", "BP12-063"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP12-068").pick("BP12-063");
    expect([t.field("opp"), t.hand()]).toEqual([[], ["BP12-063"]]);
  });
});
