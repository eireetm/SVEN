import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP10 Swordcraft (019–036). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Tokens: BP01-T05 Knight,
// BP01-T07 Steelclad Knight, BP02-T02 Shield Guardian (Ward), BP10-T01 Exterminus Weapon. Heroic
// followers: BP10-033 Windslasher (2), BP03-023 Amerro (2); BP10-035 Ernesta and BP10-025 Ilmisuna are
// Merchants; BP03-033 is a 1-cost Fable follower, BP01-039 a Princess follower.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const KNIGHT = "BP01-T05";
const STEELCLAD = "BP01-T07";
const GUARDIAN = "BP02-T02";

describe("BP10 Swordcraft", () => {
  it("019 Oluon, The Chariot — choose: a Knight, +1 attack Rush Ward, 2 to the enemy leader, or (4, bury this) Runaway Chariot from the evolve deck", () => {
    const knight = d({ me: { hand: ["BP10-019"], playPoints: 3 } }).play("BP10-019").choose("knight");
    expect(knight.field()).toEqual(["BP10-019", KNIGHT]);
    const buff = d({ me: { hand: ["BP10-019"], playPoints: 3 } }).play("BP10-019").choose("buff");
    expect([buff.stats("BP10-019"), buff.keywords("BP10-019")]).toEqual([[4, 3], ["rush", "ward"]]);
    const leader = d({ me: { hand: ["BP10-019"], playPoints: 3 } }).play("BP10-019").choose("leader");
    expect(leader.leader("opp")).toBe(18);
    const chariot = d({ me: { hand: ["BP10-019"], evolveDeck: ["BP10-020"], playPoints: 7 } }).play("BP10-019").choose("chariot").yes().pick("BP10-020");
    expect([chariot.field(), chariot.cemetery(), chariot.pp()]).toEqual([["BP10-020"], ["BP10-019"], 0]);
  });

  it("020 Oluon, Runaway Chariot — advanced; can't attack; end phase: two die rolls (1–2 destroy enemy followers, 3–4 7 to the enemy leader, 5–6 7 to your leader)", () => {
    const t = d({ me: { field: ["BP10-020"], deck: ["V1"] }, opp: { field: ["V5"], deck: ["V1"] } });
    expect(t.attackTargets("BP10-020")).toEqual([]);
    t.end();
    const rolls = t.events.flatMap((e) => (e.type === "dieRolled" ? [e.result] : []));
    expect(rolls).toHaveLength(2);
    const count = (lo: number, hi: number) => rolls.filter((r) => r >= lo && r <= hi).length;
    expect([t.field("opp").length, t.leader("opp"), t.leader()]).toEqual([count(1, 2) > 0 ? 0 : 1, 20 - 7 * count(3, 4), 20 - 7 * count(5, 6)]);
  });

  it("021 / 022 Alyaska — Fanfare summons Ilmisuna; evolved summons Ernesta and puts an Exterminus Weapon into the EX area (also when Ernesta isn't found)", () => {
    const t = d({ me: { hand: ["BP10-021"], deck: ["V1", "BP10-025"], playPoints: 5 } }).play("BP10-021").pick("BP10-025");
    expect(t.field()).toEqual(["BP10-021", "BP10-025"]);
    // Ernesta's Fanfare then gives the evolved Alyaska +1 attack and Assail.
    const evo = d({ me: { field: ["BP10-021"], evolveDeck: ["BP10-022"], deck: ["BP10-035"], playPoints: 2 } }).evolve("BP10-021").pick("BP10-035");
    expect([evo.field(), evo.ex(), evo.stats("BP10-021"), evo.keywords("BP10-021")]).toEqual([["BP10-021", "BP10-035"], ["BP10-T01"], [6, 5], ["assail"]]);
    const none = d({ me: { field: ["BP10-021"], evolveDeck: ["BP10-022"], deck: ["BP10-035"], playPoints: 2 } }).evolve("BP10-021").none();
    expect([none.field(), none.ex()]).toEqual([["BP10-021"], ["BP10-T01"]]);
  });

  it("023 / 024 Prudent General — your Swordcraft tokens have Rush; Fanfare: a Steelclad Knight; evolved: another, and every Steelclad Knight +1/+1", () => {
    const t = d({ me: { hand: ["BP10-023"], field: ["BP01-T03"], playPoints: 4 } }).play("BP10-023");
    expect([t.field(), t.keywords(STEELCLAD), t.keywords("BP01-T03")]).toEqual([["BP01-T03", "BP10-023", STEELCLAD], ["rush"], []]);
    const evo = d({ me: { field: ["BP10-023", STEELCLAD], evolveDeck: ["BP10-024"], playPoints: 1 } }).evolve("BP10-023");
    expect(evo.game.state.players[0].zones.field.slice(1).map((id) => evo.game.reader().info(id).attack)).toEqual([3, 3]);
  });

  it("025 Ilmisuna — act: 3 damage, 5 with another Merchant follower on your field", () => {
    const t = d({ me: { field: ["BP10-025"] }, opp: { field: ["V5"] } }).activate("BP10-025");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
    const five = d({ me: { field: ["BP10-025", "BP10-035"] }, opp: { field: ["V5"] } }).activate("BP10-025");
    expect(five.field("opp")).toEqual([]);
  });

  it("026 Aerial Slash — 2 damage; from the cemetery (1, banish it) with 5 other Heroic cards there: 3 to the enemy leader", () => {
    const t = d({ me: { hand: ["BP10-026"], playPoints: 1 }, opp: { field: ["V3"] } }).play("BP10-026");
    expect(t.stats("opp:V3")).toEqual([3, 2]);
    const heroic = ["BP10-027", "BP10-027", "BP10-027", "BP10-033", "BP10-033"];
    const act = d({ me: { cemetery: ["BP10-026", ...heroic], playPoints: 1 } }).activate("BP10-026");
    expect([act.leader("opp"), act.zone("me", "banished")]).toEqual([17, ["BP10-026"]]);
    expect(d({ me: { cemetery: ["BP10-026", ...heroic.slice(1)], playPoints: 1 } }).canActivate("BP10-026")).toBe(false);
  });

  it("027 / 028 Lightning Kicker — Rush; discard 2 Heroic cards: summon up to 2 Heroic followers with different names that cost 3 or less; evolved: Storm, destroys one", () => {
    const t = d({ me: { hand: ["BP10-027", "BP10-026", "BP10-033"], deck: ["BP10-033", "BP10-033", "BP03-023"], playPoints: 6 } });
    t.play("BP10-027").yes().pick("BP10-033");
    // The second one must have another name.
    expect(t.decision).toMatchObject({ type: "selectCards", candidateDefs: ["BP03-023"] });
    t.pick("BP03-023");
    expect([t.field(), t.cemetery().sort(), t.keywords("BP10-027")]).toEqual([["BP10-027", "BP10-033", "BP03-023"], ["BP10-026", "BP10-033"], ["rush"]]);
    const evo = d({ me: { field: ["BP10-027"], evolveDeck: ["BP10-028"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP10-027");
    expect([evo.field("opp"), evo.keywords("BP10-027")]).toEqual([[], ["storm"]]);
  });

  it("029 Empress of Serenity — 2 Shield Guardians; Fanfare (3): your Ward followers +1/+2", () => {
    const t = d({ me: { hand: ["BP10-029"], playPoints: 6 } }).play("BP10-029").flush().none().yes();
    const guardians = t.game.state.players[0].zones.field.filter((id) => t.game.state.cards[id]!.def === GUARDIAN);
    expect([guardians.map((id) => t.game.reader().info(id).defense), t.stats("BP10-029"), t.pp()]).toEqual([[3, 3], [1, 2], 0]);
  });

  it("030 Knight Neilan — Ward; your 1-attack followers have Aura; choose 3 damage or a Fable follower that costs 2 or less (only that without a target)", () => {
    const t = d({ me: { field: ["BP10-030", KNIGHT, "V1"] } });
    expect([t.keywords(KNIGHT), t.keywords("V1"), t.keywords("BP10-030")]).toEqual([["aura"], [], ["ward"]]);
    const dmg = d({ me: { hand: ["BP10-030"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP10-030").none().choose("damage");
    expect(dmg.stats("opp:V5")).toEqual([5, 2]);
    const fable = d({ me: { hand: ["BP10-030"], deck: ["V1", "BP03-033"], playPoints: 4 } }).play("BP10-030").none().pick("BP03-033");
    expect(fable.field()).toEqual(["BP10-030", "BP03-033"]);
  });

  it("031 / 032 Honorable Thief — mills the opponent 2, then evolves with 10 cards in their cemetery; evolved: Last Words draw", () => {
    const t = d({ me: { hand: ["BP10-031"], evolveDeck: ["BP10-032"], deck: ["V1"], playPoints: 2 }, opp: { deck: ["V1", "V3", "V5"], cemetery: Array<string>(8).fill("V1") } });
    t.play("BP10-031").yes();
    expect([t.game.reader().info(t.id("BP10-031")).evolved, t.cemetery("opp").length]).toEqual([true, 10]);
    const few = d({ me: { hand: ["BP10-031"], evolveDeck: ["BP10-032"], playPoints: 2 }, opp: { deck: ["V1", "V3"] } }).play("BP10-031");
    expect(few.game.reader().info(few.id("BP10-031")).evolved).toBe(false);
    const lw = d({ me: { field: [{ card: "BP10-031", evolvedInto: "BP10-032" }], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC");
    expect(lw.hand()).toEqual(["V1"]);
  });

  it("033 Windslasher — Rush; a Heroic card from the top 2 into the EX area", () => {
    const t = d({ me: { hand: ["BP10-033"], deck: ["V1", "BP10-027"], playPoints: 2 } }).play("BP10-033").pick("BP10-027");
    expect([t.ex(), t.keywords("BP10-033")]).toEqual([["BP10-027"], ["rush"]]);
  });

  it("034 Selfless Noble — destroys a follower, discards your hand, draws 3 (none of it without a target)", () => {
    const t = d({ me: { hand: ["BP10-034", "V1"], deck: ["V3", "V3", "V3"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP10-034");
    expect([t.field("opp"), t.hand(), t.cemetery()]).toEqual([[], ["V3", "V3", "V3"], ["V1"]]);
    const none = d({ me: { hand: ["BP10-034", "V1"], deck: ["V3"], playPoints: 7 } }).play("BP10-034");
    expect(none.hand()).toEqual(["V1"]);
  });

  it("035 Ernesta — another Swordcraft follower +1 attack and Assail; end phase with another Merchant: 2 to the enemy leader", () => {
    const t = d({ me: { hand: ["BP10-035"], field: ["BP10-025"], playPoints: 1 } }).play("BP10-035");
    expect([t.stats("BP10-025"), t.keywords("BP10-025")]).toEqual([[4, 3], ["assail"]]);
    const end = d({ me: { field: ["BP10-035", "BP10-025"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect(end.leader("opp")).toBe(18);
    const alone = d({ me: { field: ["BP10-035"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect(alone.leader("opp")).toBe(20);
  });

  it("036 Pompous Summons — choose: draw, or with a Princess follower search a Swordcraft follower (nothing without one)", () => {
    const draw = d({ me: { hand: ["BP10-036"], deck: ["V1"], playPoints: 1 } }).play("BP10-036").choose("draw");
    expect(draw.hand()).toEqual(["V1"]);
    const search = d({ me: { hand: ["BP10-036"], field: ["BP01-039"], deck: ["V1", "BP10-025"], playPoints: 1 } }).play("BP10-036").choose("search").pick("BP10-025");
    expect(search.hand()).toEqual(["BP10-025"]);
    const none = d({ me: { hand: ["BP10-036"], deck: ["V1", "BP10-025"], playPoints: 1 } }).play("BP10-036").choose("search");
    expect(none.hand()).toEqual([]);
  });

  it("T01 Exterminus Weapon — Ward; Fanfare destroys an enemy card on the field; Last Words: 4 to the enemy leader", () => {
    const t = d({ me: { ex: ["BP10-T01"], playPoints: 2 }, opp: { field: ["BP10-098"] } }).play("BP10-T01").none();
    expect([t.field("opp"), t.keywords("BP10-T01")]).toEqual([[], ["ward"]]);
    const lw = d({ me: { field: ["BP10-T01"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(lw.leader("opp")).toBe(16);
  });
});
