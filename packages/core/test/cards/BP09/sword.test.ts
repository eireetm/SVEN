import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP09 Swordcraft (018–034). V1 is 1c 2/2 (Neutral), V3 3c 3/4, V5 5c 5/5, SWORD1 1c 1/1
// Swordcraft; KILL destroys an enemy follower (1); TOKEN is a 1/1 follower token. Tokens: BP01-T05
// Knight, BP01-T07 Steelclad Knight, BP02-T02 Shield Guardian (Ward).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const KNIGHT = "BP01-T05";

describe("BP09 Swordcraft", () => {
  it("018 / 019 Celia — the front face summons a Shield Guardian", () => {
    const t = d({ me: { field: ["BP09-018"], evolveDeck: ["BP09-019"], playPoints: 1 } }).evolve("BP09-018", { into: "BP09-019" }).none();
    const info = t.game.reader().info(t.id("BP09-018"));
    expect([t.field(), info.name, info.traits]).toEqual([["BP09-018", "BP02-T02"], "Celia, Hope's Strategist", ["指揮官", "光輝"]]);
  });

  it("019_back Celia, Despair's Messenger — Storm; a Steelclad Knight and a Knight (room for one: pick which)", () => {
    const t = d({ me: { field: ["BP09-018", "V1", "V1", "V1"], evolveDeck: ["BP09-019"], playPoints: 4 } });
    t.evolve("BP09-018", { into: "BP09-019_back" }).choose("Knight");
    expect([t.field(), t.keywords("BP09-018")]).toEqual([["BP09-018", "V1", "V1", "V1", KNIGHT], ["storm"]]);
  });

  it("020 Spartacus — end phase: discard any number, draw that many +1; then 1 card or less in the deck wins the game", () => {
    const keep = d({ me: { field: ["BP09-020"], hand: ["V1", "V3"], deck: ["V5", "V5", "V5", "V5", "V5"] }, opp: { deck: ["V1"] } });
    keep.end().pick("V3").none();
    expect([keep.game.state.result, keep.zone("me", "deck").length, keep.hand()]).toEqual([null, 3, ["V1", "V5", "V5"]]);
    const none = d({ me: { field: ["BP09-020"], hand: ["V1"], deck: ["V5", "V5", "V5"] }, opp: { deck: ["V1"] } }).end().none().none();
    expect([none.hand(), none.game.state.result]).toEqual([["V1", "V5"], null]);
    const win = d({ me: { field: ["BP09-020"], hand: ["V1"], deck: ["V5", "V5", "V5"] } }).end().pick("V1");
    expect(win.game.state.result?.winner).toBe(0);
    // An empty deck: the draw fails, but the win comes first (ruling).
    const empty = d({ me: { field: ["BP09-020"] } }).end();
    expect(empty.game.state.result?.winner).toBe(0);
    // "Opponents can't win" (BP05-092) prevails (ruling, CR 1.3.3).
    const guarded = d({ me: { field: ["BP09-020"], hand: ["V1"], deck: ["V5", "V5", "V5"] }, opp: { field: ["BP05-092"], deck: ["V1"] } });
    guarded.end().pick("V1").none();
    expect(guarded.game.state.result).toBe(null);
  });

  it("021 / 022 Prim — a Knight; evolved searches Nonja, Silent Maid", () => {
    const t = d({ me: { hand: ["BP09-021"], evolveDeck: ["BP09-022"], deck: ["BP09-023", "V1"] } }).play("BP09-021").evolve("BP09-021").pick("BP09-023");
    expect([t.field(), t.hand()]).toEqual([["BP09-021", KNIGHT], ["BP09-023"]]);
  });

  it("023 Nonja — 1 less with Prim on your field; draw 2, discard 2", () => {
    expect(d({ me: { hand: ["BP09-023"], playPoints: 2 } }).canPlay("BP09-023")).toBe(false);
    const t = d({ me: { hand: ["BP09-023", "V1"], field: ["BP09-021"], deck: ["V3", "V5"], playPoints: 2 } }).play("BP09-023").pick("V1", "V3");
    expect([t.pp(), t.hand(), t.cemetery()]).toEqual([0, ["V5"], ["V1", "V3"]]);
  });

  it("024 Monochrome Duel — summons both queens with +1/+1; from the cemetery: Knights get +1 attack and Storm", () => {
    const t = d({ me: { hand: ["BP09-024"], deck: ["BP09-027", "V1", "BP09-028"], playPoints: 5 } });
    t.play("BP09-024").pick("BP09-027").pick("BP09-028");
    // Queen Hemera's Fanfare: 2 Knights, as Queen Magnus is on the field.
    expect([t.field(), t.stats("BP09-027"), t.stats("BP09-028")]).toEqual([["BP09-027", "BP09-028", KNIGHT, KNIGHT], [5, 4], [3, 3]]);
    const act = d({ me: { cemetery: ["BP09-024"], field: [KNIGHT, "V1"], playPoints: 2 } }).activate("BP09-024");
    expect([act.stats(KNIGHT), act.keywords(KNIGHT), act.zone("me", "banished"), act.pp()]).toEqual([[2, 1], ["storm"], ["BP09-024"], 0]);
  });

  it("025 / 026 Dario — Assail; evolved: +1/+1 for each enemy follower put into the cemetery on your turn (tokens too)", () => {
    expect(d({ me: { field: ["BP09-025"] }, opp: { field: ["V1"] } }).attackTargets("BP09-025")).toEqual(["V1", "opp:leader"]);
    const t = d({ me: { field: [{ card: "BP09-025", evolvedInto: "BP09-026" }], hand: ["KILL", "KILL"] }, opp: { field: ["V1", "TOKEN"] } });
    t.play("KILL").pick("opp:V1").play("KILL");
    expect(t.stats("BP09-025")).toEqual([7, 7]);
  });

  it("027 / 028 Queen Hemera and Queen Magnus — 2 Knights with Magnus, Hemera has Assail, Strike: a Knight into the EX area; Magnus +1 attack to 2 others", () => {
    const t = d({ me: { hand: ["BP09-027"], field: ["BP09-028"] }, opp: { field: ["V3"], deck: ["V1"] } }).play("BP09-027");
    expect(t.field()).toEqual(["BP09-028", "BP09-027", KNIGHT, KNIGHT]);
    t.attack("BP09-027", "opp:V3");
    expect([t.ex(), t.field("opp")]).toEqual([[KNIGHT], []]);
    const alone = d({ me: { hand: ["BP09-027"] } }).play("BP09-027");
    expect(alone.field()).toEqual(["BP09-027", KNIGHT]);
    const buff = d({ me: { field: ["BP09-028", "SWORD1", "BP09-027", "V1"] } }).activate("BP09-028").pick("SWORD1", "BP09-027");
    expect([buff.stats("SWORD1"), buff.stats("BP09-027"), buff.stats("BP09-028")]).toEqual([[2, 1], [5, 3], [2, 2]]);
  });

  it("029 / 030 Axe Princess — evolves for 4; 4 damage to an enemy follower", () => {
    expect(d({ me: { field: ["BP09-029"], evolveDeck: ["BP09-030"], playPoints: 3, evolutionPoints: 0 } }).canEvolve("BP09-029")).toBe(false);
    const t = d({ me: { field: ["BP09-029"], evolveDeck: ["BP09-030"], playPoints: 4 }, opp: { field: ["V5"] } }).evolve("BP09-029");
    expect([t.stats("opp:V5"), t.pp()]).toEqual([[5, 1], 0]);
  });

  it("031 Master Samurai — Rush; damage equal to its attack", () => {
    const t = d({ me: { hand: ["BP09-031"] }, opp: { field: ["V3"] } }).play("BP09-031");
    expect([t.stats("opp:V3"), t.keywords("BP09-031")]).toEqual([[3, 2], ["rush"]]);
  });

  it("032 Savage Swordsman — +1/+1 if there's a token follower on your field", () => {
    expect(d({ me: { hand: ["BP09-032"], field: ["TOKEN"] } }).play("BP09-032").stats("BP09-032")).toEqual([3, 3]);
    expect(d({ me: { hand: ["BP09-032"], field: ["V1"] } }).play("BP09-032").stats("BP09-032")).toEqual([2, 2]);
  });

  it("033 Tycoon — discard 3: draw 3 and recover 2 play points", () => {
    const t = d({ me: { hand: ["BP09-033", "V1", "V1", "V1"], deck: ["V3", "V3", "V3"], playPoints: 5 } }).play("BP09-033").yes();
    expect([t.hand(), t.pp(), t.cemetery()]).toEqual([["V3", "V3", "V3"], 2, ["V1", "V1", "V1"]]);
  });

  it("034 Frontline Ramparts — Quick act: engage and bury it for 3 damage", () => {
    const t = d({ me: { field: ["BP09-034"] }, opp: { field: ["V5"] } }).activate("BP09-034");
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 2], ["BP09-034"]]);
  });
});
