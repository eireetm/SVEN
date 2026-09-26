import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP19 Swordcraft (019–037, T01). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); SWORD1 (1) is a Swordcraft follower.
// Condemned Thief followers: BP19-030 (1), BP19-028 (2); BP19-035 is an Officer; BP01-042 a Ninja; BP09-023 Nonja, Silent
// Maid (Fanfare: draw 2, discard 2); BP19-032 a Maid. Tokens: BP19-T01 Dread Pirate's Flag, BP01-T07 Steelclad Knight,
// BP01-T05 Knight, BP02-T02 Shield Guardian (Ward), BP15-T01 Gilded Blade.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FLAG = "BP19-T01";
const KNIGHT = "BP01-T05";
const STEELCLAD = "BP01-T07";
const SHIELD = "BP02-T02";
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP19 Swordcraft", () => {
  it("019 Barbaros, Briny Convict — Loot cards in your EX area 1 less during your turn; Fanfare: a Dread Pirate's Flag", () => {
    expect(d({ me: { hand: ["BP19-019"], playPoints: 4 } }).play("BP19-019").ex()).toEqual([FLAG]);
    expect(d({ me: { field: ["BP19-019"], ex: [FLAG], playPoints: 0 } }).canPlay(`${FLAG}@ex`)).toBe(true);
    expect(d({ me: { field: ["BP19-030"], ex: [FLAG], playPoints: 0 } }).canPlay(`${FLAG}@ex`)).toBe(false);
  });

  it("020 Barbaros (Evolved) — playing a Loot card during your turn: an option not chosen this turn (destroy / the opponent buries 2 / recover 2)", () => {
    const t = d({ me: { field: [{ card: "BP19-019", evolvedInto: "BP19-020" }], ex: [FLAG, FLAG], playPoints: 0 }, opp: { field: ["V5", "V3"], deck: ["V1", "V1", "V1"] } });
    t.play(`${FLAG}@ex`).flush().choose("destroy").pick("opp:V5");
    expect([t.field("opp"), t.leader("opp")]).toEqual([["V3"], 19]);
    t.play(`${FLAG}@ex`).flush();
    expect(t.decision?.type === "choose" ? t.decision.options.map((o) => o.id) : []).toEqual(["mill", "recover"]);
    expect(t.choose("mill").cemetery("opp")).toEqual(["V5", "V1", "V1"]);
  });

  it("021 Radiel, Valorous Enforcer — Storm, Ward; Fanfare: banish each enemy follower with 5 Swordcraft followers; Strike, twice per turn: refresh with 10", () => {
    const t = d({ me: { hand: ["BP19-021"], field: ["SWORD1", "SWORD1"], ex: n(2, "SWORD1"), playPoints: 7 }, opp: { field: ["V5"] } }).play("BP19-021").none();
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([[], ["V5"]]);
    const ten = d({ me: { field: ["BP19-021", ...n(4, "SWORD1")], ex: n(5, "SWORD1") } }).attack("BP19-021", "opp:leader");
    expect(ten.engaged("BP19-021")).toBe(false);
    const nine = d({ me: { field: ["BP19-021", ...n(4, "SWORD1")], ex: n(4, "SWORD1") } }).attack("BP19-021", "opp:leader");
    expect(nine.engaged("BP19-021")).toBe(true);
  });

  it("022 / 023 Gildaria, Anathema of Peace — Fanfare: a Steelclad Knight and a Knight, evolve with 5 Swordcraft cards; evolved: 4 to each enemy follower, 2 to the leader", () => {
    const t = d({ me: { hand: ["BP19-022"], field: ["SWORD1", "SWORD1"], evolveDeck: ["BP19-023"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("BP19-022").yes();
    expect([t.field(), t.stats("opp:V5"), t.leader("opp")]).toEqual([["SWORD1", "SWORD1", "BP19-022", STEELCLAD, KNIGHT], [5, 1], 18]);
  });

  it("024 / 025 Warden of Honor — Ward; Fanfare: the top card into the EX area; evolved: a Warden of Honor, or (3): a Radiel", () => {
    expect(d({ me: { hand: ["BP19-024"], deck: ["V1"], playPoints: 4 } }).play("BP19-024").none().ex()).toEqual(["V1"]);
    const w = d({ me: { field: ["BP19-024"], evolveDeck: ["BP19-025"], deck: ["BP19-024", "V1"], playPoints: 1 } }).evolve("BP19-024").choose("warden").pick("BP19-024").none();
    expect(w.field()).toEqual(["BP19-024", "BP19-024"]);
    const r = d({ me: { field: ["BP19-024"], evolveDeck: ["BP19-025"], deck: ["BP19-021", "V1"], playPoints: 4 } }).evolve("BP19-024").choose("radiel").yes().pick("BP19-021").none();
    expect([r.field(), r.pp()]).toEqual([["BP19-024", "BP19-021"], 0]);
  });

  it("026 Tidal Gunner — playing a Dread Pirate's Flag: 1 damage; Fanfare: a Dread Pirate's Flag", () => {
    const t = d({ me: { field: ["BP19-026", "BP19-030"], ex: [FLAG], playPoints: 1 }, opp: { field: ["V5"] } }).play(`${FLAG}@ex`).pick("BP19-030").flush().pick("opp:V5");
    expect([t.stats("opp:V5"), t.leader("opp"), t.stats("BP19-030")]).toEqual([[5, 4], 19, [3, 2]]);
  });

  it("027 Prim, Princess's Picnic — Fanfare: a Maid follower from the deck; act (1), engage: a Nonja from the hand with Ward", () => {
    expect(d({ me: { hand: ["BP19-027"], deck: ["V1", "BP19-032"], playPoints: 2 } }).play("BP19-027").pick("BP19-032").hand()).toEqual(["BP19-032"]);
    const t = d({ me: { field: ["BP19-027"], hand: ["BP09-023"], deck: ["V1", "V3"], playPoints: 1 } }).activate("BP19-027").pick("BP09-023").flush();
    expect([t.field(), t.keywords("BP09-023")]).toEqual([["BP19-027", "BP09-023"], ["ward"]]);
  });

  it("028 / 029 Storm-Wracked First Mate — Fanfare: a Dread Pirate's Flag; evolved: a Condemned Thief follower from the deck", () => {
    expect(d({ me: { hand: ["BP19-028"], playPoints: 2 } }).play("BP19-028").ex()).toEqual([FLAG]);
    expect(d({ me: { field: ["BP19-028"], evolveDeck: ["BP19-029"], deck: ["V1", "BP19-030"], playPoints: 1 } }).evolve("BP19-028").pick("BP19-030").hand()).toEqual(["BP19-030"]);
  });

  it("030 Deep-Sea Scout — Fanfare: a Dread Pirate's Flag", () => {
    expect(d({ me: { hand: ["BP19-030"], playPoints: 1 } }).play("BP19-030").ex()).toEqual([FLAG]);
  });

  it("031 Return from the Brink — an Officer follower from the cemetery into the EX area with +1/+1", () => {
    const t = d({ me: { hand: ["BP19-031"], cemetery: ["BP19-035"], playPoints: 6 } }).play("BP19-031");
    expect(t.ex()).toEqual(["BP19-035"]);
    expect(t.play("BP19-035@ex").none().stats("BP19-035")).toEqual([6, 6]);
  });

  it("032 / 033 Felpurr Maid — Storm; Strike: draw; evolved: 1 to each enemy follower", () => {
    expect(d({ me: { field: ["BP19-032"], deck: ["V1"] } }).attack("BP19-032", "opp:leader").hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP19-032"], evolveDeck: ["BP19-033"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-032").stats("opp:V5")).toEqual([5, 4]);
  });

  it("034 Knightly Thief — Rush; Last Words: a Gilded Blade into the EX area", () => {
    expect(d({ me: { field: ["BP19-034"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual(["BP15-T01"]);
  });

  it("035 Heavy Warrior — Ward; Fanfare: 3 damage to a follower and its leader", () => {
    const t = d({ me: { hand: ["BP19-035"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP19-035").none();
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 2], 17]);
  });

  it("036 Ninja Onslaught — 2 damage (3 with a Ninja follower) and draw", () => {
    const t = d({ me: { hand: ["BP19-036"], field: ["BP01-042"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP19-036");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 2], ["V1"]]);
    expect(d({ me: { hand: ["BP19-036"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP19-036").stats("opp:V5")).toEqual([5, 3]);
  });

  it("037 Cannon Volley — a Shield Guardian and a Knight, then damage per Swordcraft follower of yours", () => {
    const t = d({ me: { hand: ["BP19-037"], field: ["SWORD1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP19-037").none();
    expect([t.field(), t.stats("opp:V5")]).toEqual([["SWORD1", SHIELD, KNIGHT], [5, 2]]);
  });

  it("T01 Dread Pirate's Flag — a Thief follower of yours +1/+0, 1 to the enemy leader if it's also Condemned", () => {
    const t = d({ me: { field: ["BP19-030"], ex: [FLAG], playPoints: 1 } }).play(`${FLAG}@ex`);
    expect([t.stats("BP19-030"), t.leader("opp")]).toEqual([[3, 2], 19]);
    const plain = d({ me: { field: ["BP19-034"], ex: [FLAG], playPoints: 1 } }).play(`${FLAG}@ex`);
    expect([plain.stats("BP19-034"), plain.leader("opp")]).toEqual([[2, 2], 20]);
    expect(d({ me: { field: ["V1"], ex: [FLAG], playPoints: 1 } }).canPlay(`${FLAG}@ex`)).toBe(false);
  });
});
