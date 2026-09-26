import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP15 Swordcraft (020–037, PR10, T01–T03). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL destroys an enemy
// follower; QUICK-SAC destroys one of your followers. BP05-018 is Octrice, Omen of Usurpation; BP06-019 Ralmia,
// Sonic Racer. Tokens: BP15-PR10 Remnant of Hollowness, BP15-T01 Gilded Blade, T02 Gilded Goblet, T03 Gilded Boots.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const REMNANT = "BP15-PR10";
const BLADE = "BP15-T01";
const GOBLET = "BP15-T02";
const BOOTS = "BP15-T03";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP15 Swordcraft", () => {
  it("020 Octrice, Hollow Usurpation — Fanfare: a Remnant of Hollowness; act (0), twice per turn: the next Loot card costs 2 less; act, banish an Octrice, Omen of Usurpation: a Gilded token", () => {
    expect(d({ me: { hand: ["BP15-020"], playPoints: 3 } }).play("BP15-020").ex()).toEqual([REMNANT]);
    // Both reductions go to the next Loot card (-4, ruling), so the second Goblet costs 2.
    const t = d({ me: { field: ["BP15-020"], ex: [GOBLET, GOBLET], playPoints: 2 } }).activate("BP15-020").activate("BP15-020");
    expect(t.canActivate("BP15-020")).toBe(false);
    t.play(`${GOBLET}@ex`).play(`${GOBLET}@ex`);
    expect([t.pp(), t.leader()]).toEqual([0, 22]);
    const act = d({ me: { field: ["BP15-020"], cemetery: ["BP05-018"] } }).activate("BP15-020", 1).choose("Gilded Boots");
    expect([act.ex(), act.zone("me", "banished")]).toEqual([[BOOTS], ["BP05-018"]]);
  });

  it("021 / 022 Kagemitsu, Lost Samurai — not from the EX area; Rush; in the EX area, a counter per evolution and summoned and evolved at 2; Last Words: into the EX area; evolved: remove counters for 1 damage / 5 to everything enemy", () => {
    expect(d({ me: { ex: ["BP15-021"], playPoints: 2 } }).canPlay("BP15-021")).toBe(false);
    expect(d({ me: { hand: ["BP15-021"], playPoints: 2 } }).play("BP15-021").keywords("BP15-021")).toEqual(["rush"]);
    // Serration Wave puts the first counter on it in the EX area; the evolution the second.
    const t = d({ me: { ex: ["BP15-021"], field: ["BP15-032"], hand: ["BP15-031"], evolveDeck: ["BP15-033", "BP15-022"], playPoints: 4 } });
    t.play("BP15-031");
    expect(t.counters("BP15-021@ex", "fightingSpirit")).toBe(1);
    t.evolve("BP15-032").yes().yes();
    expect([t.field(), t.stats("BP15-021"), t.counters("BP15-021", "fightingSpirit")]).toEqual([["BP15-032", "BP15-021"], [3, 3], 2]);
    const lw = d({ me: { field: ["BP15-021"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(lw.ex()).toEqual(["BP15-021"]);
    const full = d({ me: { field: ["BP15-021"], hand: ["QUICK-SAC"], ex: n(5) } }).play("QUICK-SAC");
    expect(full.cemetery()).toEqual(["BP15-021", "QUICK-SAC"]);
    const evo = (counters: number) => ({ card: "BP15-021", evolvedInto: "BP15-022", counters: { fightingSpirit: counters } });
    const one = d({ me: { field: [evo(2)] }, opp: { field: ["V5"] } }).activate("BP15-021");
    expect([one.stats("opp:V5"), one.counters("BP15-021", "fightingSpirit")]).toEqual([[5, 4], 1]);
    const five = d({ me: { field: [evo(5)] }, opp: { field: ["V5", "V3"] } }).activate("BP15-021", 1);
    expect([five.field("opp"), five.leader("opp"), five.keywords("BP15-021"), five.counters("BP15-021", "fightingSpirit")]).toEqual([[], 15, ["storm"], 0]);
  });

  it("023 Ralmia, Astrowing — Storm; Strike: 2 damage to each enemy follower with 5 followers on your field", () => {
    const spec = (field: string[]): DriveSpec => ({ me: { field: [{ card: "BP15-023", enteredThisTurn: true }, ...field] }, opp: { field: ["V3", "V1"] } });
    const t = d(spec(n(4))).attack("BP15-023", "opp:leader");
    expect([t.field("opp"), t.stats("opp:V3"), t.leader("opp")]).toEqual([["V3"], [3, 2], 18]);
    expect(d(spec(n(3))).attack("BP15-023", "opp:leader").field("opp")).toEqual(["V3", "V1"]);
  });

  it("024 / 025 Arsène Lupin — Fanfare: the opponent buries the top card, a Gilded Blade for a follower, a Gilded Goblet for a spell or amulet; evolved: a Thief card from the top 4", () => {
    expect(d({ me: { hand: ["BP15-024"], playPoints: 2 }, opp: { deck: ["V3"] } }).play("BP15-024").ex()).toEqual([BLADE]);
    const spell = d({ me: { hand: ["BP15-024"], playPoints: 2 }, opp: { deck: ["KILL"] } }).play("BP15-024");
    expect([spell.ex(), spell.cemetery("opp")]).toEqual([[GOBLET], ["KILL"]]);
    const evo = d({ me: { field: ["BP15-024"], evolveDeck: ["BP15-025"], deck: ["V1", "BP15-035", "V3", "V5"], playPoints: 1 } }).evolve("BP15-024").pick("BP15-035").order();
    expect(evo.hand()).toEqual(["BP15-035"]);
  });

  it("026 Ultimate Hollow — Quick; 2 damage and a Gilded Goblet; not playable without a target", () => {
    const t = d({ me: { hand: ["BP15-026"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(t.keywords("BP15-026")).toEqual(["quick"]);
    t.play("BP15-026");
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 3], [GOBLET]]);
    expect(d({ me: { hand: ["BP15-026"], playPoints: 1 } }).canPlay("BP15-026")).toBe(false);
  });

  it("027 Supersonic Breakthrough — a Ralmia follower from the deck, or (4) up to 2 differently named ones onto the field", () => {
    expect(d({ me: { hand: ["BP15-027"], deck: ["V1", "BP15-023"], playPoints: 1 } }).play("BP15-027").choose("hand").pick("BP15-023").hand()).toEqual(["BP15-023"]);
    const t = d({ me: { hand: ["BP15-027"], deck: ["BP15-023", "BP15-023", "BP06-019", "V1"], playPoints: 5 } }).play("BP15-027").choose("summon").yes().pick("BP15-023").pick("BP06-019");
    expect([t.field(), t.pp()]).toEqual([["BP15-023", "BP06-019"], 0]);
  });

  it("028 / 029 Adherent of Hollowness — Fanfare: evolves with 10 cards in the opponent's cemetery; evolved: a Gilded Blade, a Gilded Boots once per turn when you play a Loot card", () => {
    const t = d({ me: { hand: ["BP15-028"], evolveDeck: ["BP15-029"], playPoints: 2 }, opp: { cemetery: n(10) } }).play("BP15-028").yes();
    expect([t.stats("BP15-028"), t.ex()]).toEqual([[3, 3], [BLADE]]);
    expect(d({ me: { hand: ["BP15-028"], evolveDeck: ["BP15-029"], playPoints: 2 }, opp: { cemetery: n(9) } }).play("BP15-028").stats("BP15-028")).toEqual([2, 2]);
    const loot = d({ me: { field: [{ card: "BP15-028", evolvedInto: "BP15-029" }], ex: [GOBLET, GOBLET], playPoints: 4 } }).play(`${GOBLET}@ex`);
    expect(loot.ex()).toEqual([GOBLET, BOOTS]);
    expect(loot.play(`${GOBLET}@ex`).ex()).toEqual([BOOTS]);
  });

  it("030 Sword General — Ward; Fanfare: draw, up to 2 Officer followers (2 or less) from the hand", () => {
    const t = d({ me: { hand: ["BP15-030", "BP15-032", "BP15-036", "BP15-034"], deck: ["V1"], playPoints: 5 } }).play("BP15-030").none().pick("BP15-032", "BP15-036").none();
    expect([t.field(), t.hand(), t.keywords("BP15-030")]).toEqual([["BP15-030", "BP15-032", "BP15-036"], ["BP15-034", "V1"], ["ward"]]);
  });

  it("031 Serration Wave — up to 2: 2 damage to an enemy follower, a fighting spirit counter on a Kagemitsu; not playable without targets", () => {
    const t = d({ me: { hand: ["BP15-031"], field: ["BP15-021"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP15-031").choose("damage", "spirit");
    expect([t.stats("opp:V5"), t.counters("BP15-021", "fightingSpirit")]).toEqual([[5, 3], 1]);
    expect(d({ me: { hand: ["BP15-031"], playPoints: 1 } }).canPlay("BP15-031")).toBe(false);
  });

  it("032 / 033 Penguin Guardian — Ward; Fanfare (3): +2/+2", () => {
    const t = d({ me: { hand: ["BP15-032"], playPoints: 4 } }).play("BP15-032").none().yes();
    expect([t.stats("BP15-032"), t.pp(), t.keywords("BP15-032")]).toEqual([[3, 5], 0, ["ward"]]);
    expect(d({ me: { field: ["BP15-032"], evolveDeck: ["BP15-033"], playPoints: 3 } }).evolve("BP15-032").keywords("BP15-032")).toEqual(["ward"]);
  });

  it("034 Hermit of Usurpation — Fanfare: a Gilded Goblet and Boots (the player picks with room for one), the opponent buries a card; +1/+1 once per turn when you play a Loot card", () => {
    const t = d({ me: { hand: ["BP15-034"], playPoints: 3 }, opp: { deck: ["V3"] } }).play("BP15-034");
    expect([t.ex(), t.cemetery("opp")]).toEqual([[GOBLET, BOOTS], ["V3"]]);
    expect(d({ me: { hand: ["BP15-034"], ex: n(4), playPoints: 3 } }).play("BP15-034").choose("1").ex()).toEqual([...n(4), BOOTS]);
    const loot = d({ me: { field: ["BP15-034"], ex: [GOBLET, GOBLET], playPoints: 4 } }).play(`${GOBLET}@ex`);
    expect(loot.stats("BP15-034")).toEqual([4, 4]);
    expect(loot.play(`${GOBLET}@ex`).stats("BP15-034")).toEqual([4, 4]);
  });

  it("035 Chivalrous Bandit — Rush; Assail while the opponent's cemetery has 10 cards; Fanfare: a Gilded Blade, the opponent buries a card", () => {
    const t = d({ me: { hand: ["BP15-035"], playPoints: 2 }, opp: { deck: ["V1"], cemetery: n(9) } }).play("BP15-035");
    expect([t.ex(), t.keywords("BP15-035")]).toEqual([[BLADE], ["rush", "assail"]]);
    expect(d({ me: { hand: ["BP15-035"], playPoints: 2 }, opp: { deck: ["V1"], cemetery: n(8) } }).play("BP15-035").keywords("BP15-035")).toEqual(["rush"]);
  });

  it("036 Flying Messenger Squirrel — Fanfare: draw with a Commander card on your field", () => {
    expect(d({ me: { hand: ["BP15-036"], field: ["BP15-030"], deck: ["V1"], playPoints: 2 } }).play("BP15-036").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP15-036"], deck: ["V1"], playPoints: 2 } }).play("BP15-036").hand()).toEqual([]);
  });

  it("037 Brave Buccaneer — Rush; Fanfare: engage up to 2 enemy followers", () => {
    const t = d({ me: { hand: ["BP15-037"], playPoints: 3 }, opp: { field: ["V5", "V3", "V1"] } }).play("BP15-037").pick("opp:V5", "opp:V3");
    expect([t.engaged("opp:V5"), t.engaged("opp:V3"), t.engaged("opp:V1"), t.keywords("BP15-037")]).toEqual([true, true, false, ["rush"]]);
  });

  it("PR10 Remnant of Hollowness — 3 damage or a Thief card from the top 3; up to both, and 8 damage, with 10 cards in the opponent's cemetery", () => {
    expect(d({ me: { ex: [REMNANT], playPoints: 2 }, opp: { field: ["V5"] } }).play(`${REMNANT}@ex`).choose("damage").stats("opp:V5")).toEqual([5, 2]);
    const t = d({ me: { ex: [REMNANT], deck: ["V1", "BP15-024", "V3"], playPoints: 2 }, opp: { field: ["V5"], cemetery: n(10) } });
    t.play(`${REMNANT}@ex`).choose("damage", "thief").pick("BP15-024").order();
    expect([t.field("opp"), t.hand()]).toEqual([[], ["BP15-024"]]);
  });

  it("T01 Gilded Blade — 2 damage; 2 to its leader with 10 cards in the opponent's cemetery", () => {
    const t = d({ me: { ex: [BLADE], playPoints: 2 }, opp: { field: ["V5"], cemetery: n(10) } }).play(`${BLADE}@ex`);
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 18]);
    expect(d({ me: { ex: [BLADE], playPoints: 2 }, opp: { field: ["V5"], cemetery: n(9) } }).play(`${BLADE}@ex`).leader("opp")).toBe(20);
  });

  it("T02 Gilded Goblet — leader +1, +2 with 10 cards in the opponent's cemetery", () => {
    expect(d({ me: { ex: [GOBLET], playPoints: 2 } }).play(`${GOBLET}@ex`).leader()).toBe(21);
    expect(d({ me: { ex: [GOBLET], playPoints: 2 }, opp: { cemetery: n(10) } }).play(`${GOBLET}@ex`).leader()).toBe(22);
  });

  it("T03 Gilded Boots — a Thief follower gets Rush, Storm with 10 cards in the opponent's cemetery", () => {
    expect(d({ me: { ex: [BOOTS], field: ["BP15-024"], playPoints: 2 } }).play(`${BOOTS}@ex`).keywords("BP15-024")).toEqual(["rush"]);
    expect(d({ me: { ex: [BOOTS], field: ["BP15-024"], playPoints: 2 }, opp: { cemetery: n(10) } }).play(`${BOOTS}@ex`).keywords("BP15-024")).toEqual(["storm"]);
    expect(d({ me: { ex: [BOOTS], field: ["V1"], playPoints: 2 } }).canPlay(`${BOOTS}@ex`)).toBe(false);
  });
});
