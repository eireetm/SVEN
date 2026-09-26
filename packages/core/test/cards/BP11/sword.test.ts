import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP11 Swordcraft (018–034, T01). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); WARD 2c 1/3 with
// Ward; SWORD1 a 1-cost Swordcraft follower; EVOLVER-E is a faceup evolved follower. Tokens: BP11-T01
// Val, Trusty Getaway Car, BP11-T03 Dutiful Steed, BP11-T04 Bullet Bike, BP01-T07 Steelclad Knight.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const VAL = "BP11-T01";
const STEED = "BP11-T03";
const BIKE = "BP11-T04";
const KNIGHT = "BP01-T07";
const endOpponentTurn = (t: ReturnType<typeof d>) => t.game.act({ type: "mainPhase", action: { type: "endMainPhase" } });

describe("BP11 Swordcraft", () => {
  it("018 Nahtnaught — a 1-cost Swordcraft card into the EX area; once a turn (0): engage an enemy follower and Box it", () => {
    const t = d({ me: { hand: ["BP11-018"], deck: ["V1", "SWORD1"], playPoints: 4 } }).play("BP11-018").pick("SWORD1");
    expect(t.ex()).toEqual(["SWORD1"]);
    const act = d({ me: { field: ["BP11-018"], deck: ["V1"] }, opp: { field: ["WARD"], deck: ["V1"] } }).activate("BP11-018");
    expect([act.engaged("opp:WARD"), act.keywords("opp:WARD"), act.canActivate("BP11-018")]).toEqual([true, [], false]);
    act.end();
    // Boxed: it doesn't refresh in its controller's start phase (CR 5.31.3).
    expect(act.engaged("opp:WARD")).toBe(true);
    endOpponentTurn(act);
    expect(act.keywords("opp:WARD")).toEqual(["ward"]);
  });

  it("019 / 020 Bunny & Baron — evolved: a Val token, or a Desperados' Shot from the deck", () => {
    const val = d({ me: { field: ["BP11-019"], evolveDeck: ["BP11-020"], playPoints: 1 } }).evolve("BP11-019").choose("val");
    expect(val.field()).toEqual(["BP11-019", VAL]);
    const shot = d({ me: { field: ["BP11-019"], evolveDeck: ["BP11-020"], deck: ["V1", "BP11-028"], playPoints: 1 } }).evolve("BP11-019").choose("shot").pick("BP11-028");
    expect(shot.hand()).toEqual(["BP11-028"]);
  });

  it("021 / 022 Reinhardt — evolves itself with 3 faceup evolved followers in the evolve deck; evolved: Assail, end phase +2 defense to it and the leader", () => {
    const t = d({ me: { hand: ["BP11-021"], evolveDeck: ["BP11-022"], faceUpEvolveDeck: ["EVOLVER-E", "EVOLVER-E", "EVOLVER-E"], playPoints: 3 } });
    t.play("BP11-021").yes();
    expect([t.game.reader().info(t.id("BP11-021")).evolved, t.keywords("BP11-021")]).toEqual([true, ["assail"]]);
    const two = d({ me: { hand: ["BP11-021"], evolveDeck: ["BP11-022"], faceUpEvolveDeck: ["EVOLVER-E", "EVOLVER-E"], playPoints: 3 } }).play("BP11-021");
    expect(two.game.reader().info(two.id("BP11-021")).evolved).toBe(false);
    const end = d({ me: { field: [{ card: "BP11-021", evolvedInto: "BP11-022" }] }, opp: { deck: ["V1"] } }).end();
    expect([end.stats("BP11-021"), end.leader()]).toEqual([[4, 7], 22]);
  });

  it("023 Radical Gunslinger — a Dutiful Steed; engage it and 2 Mounts: 2 damage to an enemy leader or follower", () => {
    expect(d({ me: { hand: ["BP11-023"], playPoints: 1 } }).play("BP11-023").field()).toEqual(["BP11-023", STEED]);
    const t = d({ me: { field: ["BP11-023", STEED, BIKE] } }).activate("BP11-023");
    expect([t.leader("opp"), t.engaged(STEED), t.engaged(BIKE)]).toEqual([18, true, true]);
    expect(d({ me: { field: ["BP11-023", STEED] } }).canActivate("BP11-023")).toBe(false);
  });

  it("024 Tyrant's Order — destroys up to 1 Boxed enemy follower and searches a Wasteland follower", () => {
    const t = d({ me: { field: ["BP11-018"], hand: ["BP11-024"], deck: ["V1", "BP11-019"], playPoints: 1 }, opp: { field: ["V5", "V1"] } });
    t.activate("BP11-018").pick("opp:V5").play("BP11-024").pick("opp:V5").pick("BP11-019");
    expect([t.field("opp"), t.hand()]).toEqual([["V1"], ["BP11-019"]]);
    const none = d({ me: { hand: ["BP11-024"], deck: ["V1", "BP11-019"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP11-024").pick("BP11-019");
    expect([none.field("opp"), none.hand()]).toEqual([["V5"], ["BP11-019"]]);
  });

  it("025 / 026 Stalwart Slinger — destroys an enemy card; evolved: Assail and 3 damage to the enemy leader", () => {
    expect(d({ me: { hand: ["BP11-025"], playPoints: 6 }, opp: { field: ["AMULET"] } }).play("BP11-025").field("opp")).toEqual([]);
    const evo = d({ me: { field: ["BP11-025"], evolveDeck: ["BP11-026"], playPoints: 1 } }).evolve("BP11-025");
    expect([evo.leader("opp"), evo.keywords("BP11-025")]).toEqual([17, ["assail"]]);
  });

  it("027 Outlaw Gunner — a Bullet Bike; Last Words 2 damage to the enemy leader", () => {
    expect(d({ me: { hand: ["BP11-027"], playPoints: 2 } }).play("BP11-027").field()).toEqual(["BP11-027", BIKE]);
    expect(d({ me: { field: ["BP11-027"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").leader("opp")).toBe(18);
  });

  it("028 Desperados' Shot — 4 damage, or 6 and 2 to its leader with Bunny & Baron and Val on your field", () => {
    const t = d({ me: { hand: ["BP11-028"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-028");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 20]);
    const duo = d({ me: { hand: ["BP11-028"], field: ["BP11-019", VAL], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-028");
    expect([duo.field("opp"), duo.leader("opp")]).toEqual([[], 18]);
  });

  it("029 / 030 Shinobi Tanuki — evolved: Intimidate", () => {
    expect(d({ me: { field: ["BP11-029"], evolveDeck: ["BP11-030"], playPoints: 1 } }).evolve("BP11-029").keywords("BP11-029")).toEqual(["intimidate"]);
  });

  it("031 Naht's Henchman — 1 less from the EX area and a draw with Nahtnaught on your field", () => {
    const t = d({ me: { ex: ["BP11-031"], field: ["BP11-018"], deck: ["V1"], playPoints: 0 } }).play("BP11-031");
    expect([t.field(), t.hand()]).toEqual([["BP11-018", "BP11-031"], ["V1"]]);
    expect(d({ me: { ex: ["BP11-031"], playPoints: 0 } }).canPlay("BP11-031")).toBe(false);
  });

  it("032 Frontline Instructor — Fanfare (X): X Steelclad Knights; engage: Swordcraft followers on your field get Rush and Assail this turn", () => {
    const t = d({ me: { hand: ["BP11-032"], playPoints: 4 } }).play("BP11-032").yes().choose("2");
    expect([t.field(), t.pp()]).toEqual([["BP11-032", KNIGHT, KNIGHT], 0]);
    const act = d({ me: { field: ["BP11-032", "SWORD1", "V1"] } }).activate("BP11-032");
    expect([act.keywords("SWORD1"), act.keywords("V1")]).toEqual([["rush", "assail"], []]);
  });

  it("033 Bandit Raid — may summon a follower that costs 3 or less from the top 4; a Thief gets +1/+1 and Rush", () => {
    const t = d({ me: { hand: ["BP11-033"], deck: ["V5", "BP11-019", "V1", "V3"], playPoints: 3 } }).play("BP11-033").pick("BP11-019").order();
    expect([t.field(), t.stats("BP11-019"), t.keywords("BP11-019"), t.zone("me", "deck")]).toEqual([
      ["BP11-019"],
      [4, 4],
      ["rush"],
      ["V5", "V1", "V3"],
    ]);
    const plain = d({ me: { hand: ["BP11-033"], deck: ["V5", "V1"], playPoints: 3 } }).play("BP11-033").pick("V1");
    expect([plain.stats("V1"), plain.keywords("V1")]).toEqual([[2, 2], []]);
  });

  it("034 Dramatic Retreat — Quick, not during your turn: a follower of yours into its owner's EX area", () => {
    expect(d({ me: { hand: ["BP11-034"], field: ["V1"] } }).canPlay("BP11-034")).toBe(false);
    const t = d({ turn: 6, me: { hand: ["BP11-034"], field: [{ card: "V3", engaged: true }] }, opp: { field: ["V5"] } });
    t.attack("opp:V5", "V3").quick("BP11-034");
    expect([t.field(), t.ex(), t.stats("opp:V5")]).toEqual([[], ["V3"], [5, 5]]);
  });

  it("T01 Val — Storm; maneuvered by engaging a Bunny & Baron, or (1) and 2 followers; Strike draws with another Wasteland follower", () => {
    const t = d({ me: { field: [VAL, "BP11-019"], deck: ["V1"] } }).activate(VAL);
    expect([t.stats(VAL), t.engaged("BP11-019"), t.keywords(VAL)]).toEqual([[3, 3], true, ["storm"]]);
    t.attack(VAL, "opp:leader");
    expect([t.leader("opp"), t.hand()]).toEqual([17, ["V1"]]);
    // Without a Bunny & Baron, the second ability is the only one available.
    const two = d({ me: { field: [VAL, "V1", "V3"], deck: ["V1"], playPoints: 1 } }).activate(VAL);
    expect([two.stats(VAL), two.engaged("V1"), two.engaged("V3")]).toEqual([[3, 3], true, true]);
    two.attack(VAL, "opp:leader");
    expect(two.hand()).toEqual([]);
  });
});
