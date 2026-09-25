import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../src/testing";
import { cardEngine } from "../helpers";

// Engine behaviour added for BP07 that the card tests do not show directly. V1 is 1c 2/2, V5 5c
// 5/5; QUICK-SAC destroys a follower of yours (0). BP07-T02 Repair Mode is a Quick Machina spell
// token; BP07-T03 Naterran Great Tree a token amulet; BP01-T10 Magic Sediment has Stack.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const REPAIR = "BP07-T02";
const TREE = "BP07-T03";
const TETRA = { card: "BP07-035", evolvedInto: "BP07-036" };
const HUNTERS = ["BP01-018", "BP01-018", "BP01-018"];

describe("BP07 mechanics", () => {
  it("'4 times per turn' counts each card's own triggers, in either player's turn (CR 10.7.2.2, BP07-036 rulings)", () => {
    const two = d({ me: { field: [TETRA, TETRA], ex: [REPAIR] }, opp: { field: ["V5"] } }).play(REPAIR).flush();
    expect(two.stats("opp:V5")).toEqual([5, 3]);
    // In the opponent's end phase: a Quick Machina card played from the EX area.
    const theirs = d({ me: { field: [TETRA], ex: [REPAIR], deck: ["V1"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().end().quick(REPAIR);
    expect([theirs.stats("opp:V5"), theirs.leader()]).toEqual([[5, 4], 21]);
  });

  it("an activated ability valid in the cemetery can only be activated there (CR 10.3.5, BP07-038)", () => {
    expect(d({ me: { hand: ["BP07-038"], playPoints: 6 } }).canActivate("BP07-038")).toBe(false);
    expect(d({ me: { cemetery: ["BP07-038"], playPoints: 6 } }).canActivate("BP07-038")).toBe(true);
    expect(d({ me: { cemetery: ["BP07-038"], playPoints: 5 } }).canActivate("BP07-038")).toBe(false);
  });

  it("a given Last Words triggers with look-back, together with 'a follower put from your field into the cemetery' (BP07-038 ruling)", () => {
    const t = d({ me: { field: ["BP05-076", "BP01-T10"], cemetery: ["BP07-038"], hand: ["QUICK-SAC"], playPoints: 6 } });
    t.activate("BP07-038").choose("attack").yes();
    t.play("QUICK-SAC").pick("BP07-038").flush();
    expect([t.zone("me", "banished"), t.cemetery(), t.stats("BP05-076")]).toEqual([["BP07-038"], ["QUICK-SAC"], [3, 3]]);
  });

  it("an effect can't evolve a follower another player controls (BP07-104 ruling, CR 4.6.2)", () => {
    // Steal the opponent's Viridia Magna, destroy it: its Last Words is yours, it returns to its
    // owner's field, can't be evolved by you, and is banished.
    const t = d({
      me: { field: ["BP03-109", TREE], cemetery: ["BP03-119", "BP03-119", "BP03-119"], hand: ["QUICK-SAC"], deck: ["V1"] },
      opp: { field: ["BP07-104"], evolveDeck: ["BP07-105"] },
    });
    t.activate("BP03-109");
    expect(t.field()).toEqual(["BP03-109", TREE, "BP07-104"]);
    t.play("QUICK-SAC").pick("BP07-104").yes();
    expect([t.field("opp"), t.zone("opp", "banished"), t.zone("opp", "evolveDeck")]).toEqual([[], ["BP07-104"], ["BP07-105"]]);
  });

  it("'Evolve costs 1 less this turn' adds up and never goes below 0 (BP07-086 rulings)", () => {
    const t = d({
      me: { field: ["BP07-086"], ex: [REPAIR, REPAIR, REPAIR, REPAIR, REPAIR], hand: ["BP07-090", "BP07-097", "BP07-116"], evolveDeck: ["BP07-087"], playPoints: 6 },
    });
    const activate = () => {
      t.activate("BP07-086");
      if (t.decision?.type === "selectCards") t.pick(REPAIR);
    };
    for (let i = 0; i < 5; i++) activate();
    t.play("BP07-090").play("BP07-097").none().play("BP07-116").choose("repair"); // 3 more Repair Modes
    for (let i = 0; i < 3; i++) activate(); // 8 in total: 7 - 8
    expect([t.pp(), t.canEvolve("BP07-086")]).toEqual([0, true]);
    t.evolve("BP07-086");
    expect(t.pp()).toBe(0);
  });

  it("a follower changed into an amulet is not a follower going to the cemetery, nor a Machina follower for Rush (BP07-005 / 069 rulings)", () => {
    // Turn 6 is the opponent's: their Ezdia changes our followers into amulets.
    const t = d({
      turn: 6,
      me: { field: ["BP07-005", "BP07-080", "BP07-081"], deck: ["V1"] },
      opp: { hand: ["BP05-001"], cemetery: HUNTERS, playPoints: 10, deck: ["V1"] },
    });
    expect(t.keywords("BP07-080")).toEqual(["assail", "bane", "rush"]);
    t.play("opp:BP05-001").pick("BP07-081");
    expect(t.keywords("BP07-080")).toEqual(["assail", "bane"]);
    t.end(); // our turn 7
    t.activate("BP07-081"); // "Activate {[cost02]}: Put this card into its owner's cemetery."
    t.end().none();
    expect([t.stats("BP07-005"), t.leader()]).toEqual([[3, 5], 24]);
  });

  it("'They cost 0 play points to play this turn' ends with the turn (BP07-071)", () => {
    const t = d({ me: { hand: ["BP07-071"], cemetery: ["BP06-087"], playPoints: 7 }, opp: { deck: ["V1"] } }).play("BP07-071").pick("BP06-087");
    const setCosts = () => t.game.state.effects.filter((e) => e.change.kind === "playCostSet").length;
    expect(setCosts()).toBe(1);
    t.end();
    expect(setCosts()).toBe(0);
  });
});
